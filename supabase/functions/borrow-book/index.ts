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
    // 1. Check book availability
    const { data: book, error: bookError } = await supabaseClient
      .from('books')
      .select('available_copies, total_copies, title')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      return new Response(JSON.stringify({ error: 'Book not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (book.available_copies <= 0) {
      return new Response(JSON.stringify({ error: 'Book not available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Check if user already has this book
    const { data: existingRecord } = await supabaseClient
      .from('borrowing_records')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .single()

    if (existingRecord) {
      return new Response(JSON.stringify({ error: 'Book already borrowed by user' }), {
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
        status: 'active'
      })

    if (borrowError) {
      return new Response(JSON.stringify({ error: borrowError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 5. Update book availability
    const { error: updateError } = await supabaseClient
      .from('books')
      .update({ available_copies: book.available_copies - 1 })
      .eq('id', bookId)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully borrowed "${book.title}"`,
      dueDate: dueDate.toISOString()
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