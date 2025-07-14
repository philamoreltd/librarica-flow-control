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

    const { borrowingRecordId } = await req.json()

    // Get user session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // 1. Get borrowing record with book info
    const { data: borrowRecord, error: borrowError } = await supabaseClient
      .from('borrowing_records')
      .select(`
        *,
        books (id, title, available_copies)
      `)
      .eq('id', borrowingRecordId)
      .eq('status', 'active')
      .single()

    if (borrowError || !borrowRecord) {
      return new Response(JSON.stringify({ error: 'Active borrowing record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const returnDate = new Date()
    const dueDate = new Date(borrowRecord.due_date)
    
    // Calculate fine if overdue (e.g., $0.50 per day)
    let fineAmount = 0
    if (returnDate > dueDate) {
      const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      fineAmount = daysOverdue * 0.50
    }

    // 2. Update borrowing record
    const { error: updateBorrowError } = await supabaseClient
      .from('borrowing_records')
      .update({
        returned_at: returnDate.toISOString(),
        status: 'returned',
        fine_amount: fineAmount
      })
      .eq('id', borrowingRecordId)

    if (updateBorrowError) {
      return new Response(JSON.stringify({ error: updateBorrowError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Update book availability
    const { error: updateBookError } = await supabaseClient
      .from('books')
      .update({ 
        available_copies: borrowRecord.books.available_copies + 1 
      })
      .eq('id', borrowRecord.book_id)

    if (updateBookError) {
      return new Response(JSON.stringify({ error: updateBookError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Check for reservations and notify if applicable
    const { data: nextReservation } = await supabaseClient
      .from('reservations')
      .select(`
        *,
        profiles (first_name, last_name, email)
      `)
      .eq('book_id', borrowRecord.book_id)
      .eq('status', 'active')
      .order('reserved_at', { ascending: true })
      .limit(1)
      .single()

    let reservationMessage = ''
    if (nextReservation) {
      reservationMessage = ` Book is now available for ${nextReservation.profiles.first_name} ${nextReservation.profiles.last_name} who has a reservation.`
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully returned "${borrowRecord.books.title}".${reservationMessage}`,
      fineAmount: fineAmount,
      wasOverdue: fineAmount > 0
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