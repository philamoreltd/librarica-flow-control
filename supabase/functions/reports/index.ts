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

    const url = new URL(req.url)
    const reportType = url.searchParams.get('type')

    switch (reportType) {
      case 'library_overview':
        return await getLibraryOverview(supabaseClient)
      
      case 'overdue_books':
        return await getOverdueBooks(supabaseClient)
      
      case 'popular_books':
        return await getPopularBooks(supabaseClient)
      
      case 'user_activity':
        return await getUserActivityReport(supabaseClient)
      
      case 'fines_report':
        return await getFinesReport(supabaseClient)
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid report type' }), {
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

async function getLibraryOverview(supabaseClient: any) {
  // Get total books
  const { count: totalBooks } = await supabaseClient
    .from('books')
    .select('*', { count: 'exact', head: true })

  // Get total users
  const { count: totalUsers } = await supabaseClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get active loans
  const { count: activeLoans } = await supabaseClient
    .from('borrowing_records')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get active reservations
  const { count: activeReservations } = await supabaseClient
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get overdue books
  const { count: overdueBooks } = await supabaseClient
    .from('borrowing_records')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .lt('due_date', new Date().toISOString())

  return new Response(JSON.stringify({
    totalBooks,
    totalUsers,
    activeLoans,
    activeReservations,
    overdueBooks
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getOverdueBooks(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('borrowing_records')
    .select(`
      *,
      books (title, author),
      profiles (first_name, last_name, email)
    `)
    .eq('status', 'active')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const overdueBooks = data.map((record: any) => ({
    ...record,
    daysOverdue: Math.ceil((new Date().getTime() - new Date(record.due_date).getTime()) / (1000 * 60 * 60 * 24))
  }))

  return new Response(JSON.stringify({ overdueBooks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getPopularBooks(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('borrowing_records')
    .select(`
      book_id,
      books (title, author, category)
    `)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Count borrowings per book
  const bookCounts = data.reduce((acc: any, record: any) => {
    const bookId = record.book_id
    if (!acc[bookId]) {
      acc[bookId] = {
        count: 0,
        book: record.books
      }
    }
    acc[bookId].count++
    return acc
  }, {})

  // Sort by popularity
  const popularBooks = Object.values(bookCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10)

  return new Response(JSON.stringify({ popularBooks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getUserActivityReport(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select(`
      *,
      borrowing_records (count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ userActivity: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getFinesReport(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('borrowing_records')
    .select(`
      *,
      books (title, author),
      profiles (first_name, last_name, email)
    `)
    .gt('fine_amount', 0)
    .order('fine_amount', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const totalFines = data.reduce((sum: number, record: any) => sum + (record.fine_amount || 0), 0)

  return new Response(JSON.stringify({ 
    fines: data,
    totalFines 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}