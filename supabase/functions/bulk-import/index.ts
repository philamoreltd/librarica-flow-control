import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user has admin/librarian role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'librarian'].includes(profile.role)) {
      return new Response('Forbidden: Admin or Librarian access required', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    const { type, data } = await req.json()

    if (type === 'books') {
      return await importBooks(supabaseClient, data)
    } else if (type === 'students') {
      return await importStudents(supabaseClient, data)
    } else {
      return new Response(JSON.stringify({ error: 'Invalid import type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function importBooks(supabaseClient: any, books: any[]) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (const book of books) {
    try {
      // Validate required fields
      if (!book.title || !book.author || !book.category) {
        results.failed++
        results.errors.push(`Book missing required fields: ${book.title || 'Unknown'}`)
        continue
      }

      // Check for existing book by ISBN if provided
      if (book.isbn) {
        const { data: existing } = await supabaseClient
          .from('books')
          .select('id')
          .eq('isbn', book.isbn)
          .single()

        if (existing) {
          results.failed++
          results.errors.push(`Book with ISBN ${book.isbn} already exists`)
          continue
        }
      }

      const { error } = await supabaseClient
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          isbn: book.isbn || null,
          category: book.category,
          description: book.description || null,
          grade_level: book.grade_level || null,
          points: parseInt(book.points) || 1,
          total_copies: parseInt(book.total_copies) || 1,
          available_copies: parseInt(book.available_copies) || parseInt(book.total_copies) || 1
        })

      if (error) {
        results.failed++
        results.errors.push(`Failed to import "${book.title}": ${error.message}`)
      } else {
        results.successful++
      }
    } catch (error) {
      results.failed++
      results.errors.push(`Error processing book "${book.title}": ${error.message}`)
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function importStudents(supabaseClient: any, students: any[]) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (const student of students) {
    try {
      // Validate required fields
      if (!student.first_name || !student.last_name || !student.student_id) {
        results.failed++
        results.errors.push(`Student missing required fields: ${student.first_name || ''} ${student.last_name || ''}`)
        continue
      }

      // Validate that at least email or phone is provided
      if (!student.email?.trim() && !student.phone_number?.trim()) {
        results.failed++
        results.errors.push(`Student ${student.first_name} ${student.last_name} missing both email and phone number`)
        continue
      }

      console.log('Adding student:', student)

      // Prepare auth data with either email or phone
      const authData: any = {
        password: student.password || 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: student.first_name,
          middle_name: student.middle_name || '',
          last_name: student.last_name
        }
      }

      if (student.email?.trim()) {
        authData.email = student.email.trim()
        
        // Check for existing user by email
        const { data: existingUser } = await supabaseClient.auth.admin.listUsers()
        const userExists = existingUser.users.some((u: any) => u.email === student.email)

        if (userExists) {
          results.failed++
          results.errors.push(`User with email ${student.email} already exists`)
          continue
        }
      }

      if (student.phone_number?.trim()) {
        authData.phone = student.phone_number.trim()
      }

      // Create user account
      const { data: newUser, error: authError } = await supabaseClient.auth.admin.createUser(authData)

      if (authError || !newUser.user) {
        console.error('Auth user creation error:', authError)
        results.failed++
        results.errors.push(`Failed to create account for ${student.first_name} ${student.last_name}: ${authError?.message}`)
        continue
      }

      // Update profile with additional information
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          middle_name: student.middle_name || null,
          phone_number: student.phone_number || null,
          role: student.role || 'student',
          grade_level: student.grade_level || null,
          student_id: student.student_id || null,
          points: parseInt(student.points) || 0
        })
        .eq('id', newUser.user.id)

      if (profileError) {
        results.failed++
        results.errors.push(`Failed to update profile for ${student.first_name} ${student.last_name}: ${profileError.message}`)
      } else {
        results.successful++
      }
    } catch (error) {
      results.failed++
      results.errors.push(`Error processing student "${student.first_name} ${student.last_name}": ${error.message}`)
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}