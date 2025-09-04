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

    const { action, bookData, bookId } = await req.json();

    switch (action) {
      case 'add_book':
        return await addBook(supabaseClient, bookData);
      case 'update_book':
        return await updateBook(supabaseClient, bookId, bookData);
      case 'delete_book':
        return await deleteBook(supabaseClient, bookId);
      case 'get_books':
        return await getAllBooks(supabaseClient);
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

async function addBook(supabaseClient: any, bookData: any) {
  console.log('Adding book:', bookData);
  
  const { data, error } = await supabaseClient
    .from('books')
    .insert({
      title: bookData.title,
      author: bookData.author,
      category: bookData.category,
      isbn: bookData.isbn || null,
      description: bookData.description || null,
      grade_level: bookData.grade_level || null,
      points: parseInt(bookData.points) || 1,
      total_copies: parseInt(bookData.total_copies) || 1,
      available_copies: parseInt(bookData.available_copies) || parseInt(bookData.total_copies) || 1,
      cover_image: bookData.cover_image || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Add book error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Book added successfully', book: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateBook(supabaseClient: any, bookId: string, bookData: any) {
  console.log('Updating book:', bookId, bookData);
  
  const { data, error } = await supabaseClient
    .from('books')
    .update({
      title: bookData.title,
      author: bookData.author,
      category: bookData.category,
      isbn: bookData.isbn || null,  // Convert empty string to null
      description: bookData.description || null,
      grade_level: bookData.grade_level || null,
      points: parseInt(bookData.points) || 1,
      total_copies: parseInt(bookData.total_copies) || 1,
      available_copies: parseInt(bookData.available_copies) || 1,
      cover_image: bookData.cover_image || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookId)
    .select()
    .single();

  if (error) {
    console.error('Update book error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Book updated successfully', book: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteBook(supabaseClient: any, bookId: string) {
  console.log('Deleting book:', bookId);
  
  // Check if book has active borrowing records
  const { data: activeBorrows } = await supabaseClient
    .from('borrowing_records')
    .select('id')
    .eq('book_id', bookId)
    .eq('status', 'active');

  if (activeBorrows && activeBorrows.length > 0) {
    return new Response(
      JSON.stringify({ error: 'Cannot delete book with active borrowing records' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { error } = await supabaseClient
    .from('books')
    .delete()
    .eq('id', bookId);

  if (error) {
    console.error('Delete book error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Book deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAllBooks(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('books')
    .select('*')
    .order('title');

  if (error) {
    console.error('Get books error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ books: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}