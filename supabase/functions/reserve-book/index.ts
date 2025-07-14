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

    // 1. Check if book exists
    const { data: book, error: bookError } = await supabaseClient
      .from('books')
      .select('title, available_copies')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      return new Response(JSON.stringify({ error: 'Book not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Check if user already has an active reservation
    const { data: existingReservation } = await supabaseClient
      .from('reservations')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .single()

    if (existingReservation) {
      return new Response(JSON.stringify({ error: 'Book already reserved by user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Check if user already borrowed this book
    const { data: existingBorrow } = await supabaseClient
      .from('borrowing_records')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .single()

    if (existingBorrow) {
      return new Response(JSON.stringify({ error: 'Book already borrowed by user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // 5. Create reservation
    const { error: reservationError } = await supabaseClient
      .from('reservations')
      .insert({
        user_id: userId,
        book_id: bookId,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })

    if (reservationError) {
      return new Response(JSON.stringify({ error: reservationError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully reserved "${book.title}"`,
      expiresAt: expiresAt.toISOString()
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