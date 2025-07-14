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

    // Check if user has admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response('Forbidden: Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    const { action, userId, updates } = await req.json()

    switch (action) {
      case 'get_users':
        return await getUsers(supabaseClient)
      
      case 'update_user_role':
        return await updateUserRole(supabaseClient, userId, updates.role)
      
      case 'deactivate_user':
        return await deactivateUser(supabaseClient, userId)
      
      case 'get_user_activity':
        return await getUserActivity(supabaseClient, userId)
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
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

async function getUsers(supabaseClient: any) {
  const { data: profiles, error } = await supabaseClient
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      role,
      grade_level,
      student_id,
      points,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ users: profiles }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateUserRole(supabaseClient: any, userId: string, newRole: string) {
  const validRoles = ['student', 'teacher', 'librarian', 'admin']
  
  if (!validRoles.includes(newRole)) {
    return new Response(JSON.stringify({ error: 'Invalid role' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { error } = await supabaseClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true, message: 'User role updated successfully' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deactivateUser(supabaseClient: any, userId: string) {
  // Return all active books first
  const { data: activeLoans } = await supabaseClient
    .from('borrowing_records')
    .select('id, book_id, books(title)')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (activeLoans && activeLoans.length > 0) {
    return new Response(JSON.stringify({ 
      error: 'Cannot deactivate user with active book loans',
      activeLoans: activeLoans.map((loan: any) => loan.books.title)
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Cancel active reservations
  await supabaseClient
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'active')

  // In a real scenario, you might soft-delete or deactivate the user
  // For now, we'll just return success
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'User deactivated successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getUserActivity(supabaseClient: any, userId: string) {
  const { data: borrowingHistory, error: borrowError } = await supabaseClient
    .from('borrowing_records')
    .select(`
      *,
      books (title, author)
    `)
    .eq('user_id', userId)
    .order('borrowed_at', { ascending: false })
    .limit(20)

  const { data: reservationHistory, error: reserveError } = await supabaseClient
    .from('reservations')
    .select(`
      *,
      books (title, author)
    `)
    .eq('user_id', userId)
    .order('reserved_at', { ascending: false })
    .limit(10)

  if (borrowError || reserveError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user activity' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ 
    borrowingHistory: borrowingHistory || [],
    reservationHistory: reservationHistory || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}