import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
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

    // Check if user is admin or librarian
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

    const body = await req.json();
    const { action, bookId, copiesCount } = body;

    switch (action) {
      case 'generate_copies':
        return await generateBookCopies(supabaseClient, bookId, copiesCount);
      case 'get_book_copies':
        return await getBookCopies(supabaseClient, bookId);
      case 'update_copy_status':
        const { copyId, status, notes, isbn } = body;
        return await updateCopyStatus(supabaseClient, copyId, status, notes, isbn);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateBookCopies(supabaseClient: any, bookId: string, copiesCount: number) {
  console.log('Generating book copies for book:', bookId, 'Count:', copiesCount);
  
  try {
    // Get existing copies count
    const { data: existingCopies } = await supabaseClient
      .from('book_copies')
      .select('copy_number')
      .eq('book_id', bookId)
      .order('copy_number', { ascending: false })
      .limit(1);

    const startCopyNumber = existingCopies?.length > 0 ? existingCopies[0].copy_number + 1 : 1;
    
    // Generate copies
    const copiesToInsert = [];
    for (let i = 0; i < copiesCount; i++) {
      const copyNumber = startCopyNumber + i;
      
      // Generate barcode using the database function
      const { data: barcodeResult } = await supabaseClient
        .rpc('generate_book_copy_barcode', {
          book_id_param: bookId,
          copy_number_param: copyNumber
        });

      // Generate ISBN using the database function
      const { data: isbnResult } = await supabaseClient
        .rpc('generate_copy_isbn', {
          book_id_param: bookId
        });

      copiesToInsert.push({
        book_id: bookId,
        copy_number: copyNumber,
        barcode: barcodeResult,
        isbn: isbnResult,
        status: 'available'
      });
    }

    const { data, error } = await supabaseClient
      .from('book_copies')
      .insert(copiesToInsert)
      .select();

    if (error) {
      console.error('Insert copies error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Book copies generated successfully', copies: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate copies error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getBookCopies(supabaseClient: any, bookId: string) {
  const { data, error } = await supabaseClient
    .from('book_copies')
    .select('*')
    .eq('book_id', bookId)
    .order('copy_number');

  if (error) {
    console.error('Get book copies error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ copies: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateCopyStatus(supabaseClient: any, copyId: string, status: string, notes?: string, isbn?: string) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };
  
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  
  if (isbn !== undefined) {
    updateData.isbn = isbn;
  }

  const { data, error } = await supabaseClient
    .from('book_copies')
    .update(updateData)
    .eq('id', copyId)
    .select()
    .single();

  if (error) {
    console.error('Update copy status error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Copy status updated successfully', copy: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}