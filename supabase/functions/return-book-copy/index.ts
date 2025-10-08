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

    const { copyId } = await req.json();

    if (!copyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: copyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the book copy to find the book_id
    const { data: copy, error: copyError } = await supabaseClient
      .from('book_copies')
      .select('book_id')
      .eq('id', copyId)
      .single();

    if (copyError || !copy) {
      console.error('Error fetching copy:', copyError);
      return new Response(
        JSON.stringify({ error: 'Book copy not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the active borrowing record for this book
    const { data: borrowingRecords, error: borrowError } = await supabaseClient
      .from('borrowing_records')
      .select('id')
      .in('book_id', [copy.book_id, copyId])
      .or('status.eq.active,returned_at.is.null')
      .order('borrowed_at', { ascending: false })
      .limit(1);

    if (borrowError) {
      console.error('Error fetching borrowing record:', borrowError);
      throw borrowError;
    }

    if (!borrowingRecords || borrowingRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active borrowing record found for this book' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update borrowing record
    const { error: updateBorrowError } = await supabaseClient
      .from('borrowing_records')
      .update({
        returned_at: new Date().toISOString(),
        status: 'returned'
      })
      .eq('id', borrowingRecords[0].id);

    if (updateBorrowError) {
      console.error('Error updating borrowing record:', updateBorrowError);
      throw updateBorrowError;
    }

    // Update copy status back to available
    const { error: updateError } = await supabaseClient
      .from('book_copies')
      .update({ 
        status: 'available',
        notes: `Returned on ${new Date().toLocaleDateString()}`
      })
      .eq('id', copyId);

    if (updateError) {
      console.error('Error updating copy status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Book copy returned successfully'
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
