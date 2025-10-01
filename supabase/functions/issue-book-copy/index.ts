import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: user, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!profile || !['admin', 'librarian'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin or Librarian access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { copyId, studentId, dueDate } = await req.json();

    if (!copyId || !studentId || !dueDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: copyId, studentId, dueDate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if copy is available
    const { data: copy, error: copyError } = await supabaseClient
      .from('book_copies')
      .select('*, books(*)')
      .eq('id', copyId)
      .eq('status', 'available')
      .single();

    if (copyError || !copy) {
      return new Response(
        JSON.stringify({ error: 'Book copy not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create borrowing record
    const { data: borrowingRecord, error: borrowError } = await supabaseClient
      .from('borrowing_records')
      .insert({
        user_id: studentId,
        book_id: copy.book_id,
        borrowed_at: new Date().toISOString(),
        due_date: dueDate,
        status: 'active',
        department_id: copy.books.department_id
      })
      .select()
      .single();

    if (borrowError) {
      console.error('Error creating borrowing record:', borrowError);
      throw borrowError;
    }

    // Update copy status to borrowed
    const { error: updateError } = await supabaseClient
      .from('book_copies')
      .update({ 
        status: 'borrowed',
        notes: `Issued to student on ${new Date().toLocaleDateString()}`
      })
      .eq('id', copyId);

    if (updateError) {
      console.error('Error updating copy status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Book copy issued successfully',
        borrowingRecord 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
