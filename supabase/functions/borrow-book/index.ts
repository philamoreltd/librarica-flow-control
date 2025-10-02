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

    const { bookId, userId } = await req.json()

    // Get user session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Start transaction-like operations
    // 1. Get an available book copy
    const { data: availableCopy, error: copyError } = await supabaseClient
      .from('book_copies')
      .select('*, books(title, department_id)')
      .eq('book_id', bookId)
      .eq('status', 'available')
      .limit(1)
      .single()

    if (copyError || !availableCopy) {
      return new Response(JSON.stringify({ error: 'No available copies for this book' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Check if user already has an active copy of this book
    const { data: existingRecord } = await supabaseClient
      .from('borrowing_records')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .single()

    if (existingRecord) {
      return new Response(JSON.stringify({ error: 'User already has an active copy of this book' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Calculate due date (2 weeks from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    // 4. Create borrowing record
    const { error: borrowError } = await supabaseClient
      .from('borrowing_records')
      .insert({
        user_id: userId,
        book_id: bookId,
        due_date: dueDate.toISOString(),
        status: 'active',
        department_id: availableCopy.books.department_id
      })

    if (borrowError) {
      return new Response(JSON.stringify({ error: borrowError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 5. Update book copy status
    const { error: updateError } = await supabaseClient
      .from('book_copies')
      .update({ 
        status: 'borrowed',
        notes: `Borrowed on ${new Date().toLocaleDateString()}`
      })
      .eq('id', availableCopy.id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully borrowed "${availableCopy.books.title}" (Copy #${availableCopy.copy_number})`,
      dueDate: dueDate.toISOString(),
      copyId: availableCopy.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})