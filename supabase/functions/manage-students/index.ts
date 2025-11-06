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

    const { action, studentData, studentId } = await req.json();

    switch (action) {
      case 'add_student':
        return await addStudent(supabaseClient, studentData);
      case 'update_student':
        return await updateStudent(supabaseClient, studentId, studentData);
      case 'deactivate_student':
        return await deactivateStudent(supabaseClient, studentId);
      case 'get_students':
        return await getAllStudents(supabaseClient);
      case 'get_student_activity':
        return await getStudentActivity(supabaseClient, studentId);
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

async function addStudent(supabaseClient: any, studentData: any) {
  console.log('Adding student:', studentData);
  
  // Validate that either email or phone is provided
  if (!studentData.email && !studentData.phone_number) {
    return new Response(
      JSON.stringify({ error: 'Either email or phone number is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Format phone number to E.164 format if provided
  let formattedPhone = null;
  if (studentData.phone_number) {
    let phone = studentData.phone_number.trim();
    // Remove any spaces, dashes, or parentheses
    phone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert Kenyan format to E.164
    if (phone.startsWith('0')) {
      phone = '+254' + phone.substring(1);
    } else if (phone.startsWith('254')) {
      phone = '+' + phone;
    } else if (!phone.startsWith('+')) {
      phone = '+254' + phone;
    }
    
    formattedPhone = phone;
  }
  
  // Create auth user first
  const authUserData: any = {
    password: studentData.password || 'TempPass123!',
    email_confirm: true,
    user_metadata: {
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      role: 'student'
    }
  };

  // Use email if provided, otherwise use formatted phone
  if (studentData.email) {
    authUserData.email = studentData.email;
  } else {
    authUserData.phone = formattedPhone;
  }

  const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser(authUserData);

  if (authError) {
    console.error('Auth user creation error:', authError);
    return new Response(
      JSON.stringify({ error: authError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update profile with additional student data
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({
      student_id: studentData.student_id,
      grade_level: studentData.grade_level,
      points: parseInt(studentData.points) || 0,
    })
    .eq('id', authUser.user.id)
    .select()
    .single();

  if (error) {
    console.error('Profile update error:', error);
    // Clean up auth user if profile update fails
    await supabaseClient.auth.admin.deleteUser(authUser.user.id);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      message: 'Student added successfully', 
      student: data,
      temporary_password: studentData.password || 'TempPass123!'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateStudent(supabaseClient: any, studentId: string, studentData: any) {
  console.log('Updating student:', studentId, studentData);
  
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      email: studentData.email,
      student_id: studentData.student_id,
      grade_level: studentData.grade_level,
      points: parseInt(studentData.points) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId)
    .select()
    .single();

  if (error) {
    console.error('Update student error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Student updated successfully', student: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deactivateStudent(supabaseClient: any, studentId: string) {
  console.log('Deactivating student:', studentId);
  
  // Check for active borrowing records
  const { data: activeBorrows } = await supabaseClient
    .from('borrowing_records')
    .select('id, books(title)')
    .eq('user_id', studentId)
    .eq('status', 'active');

  if (activeBorrows && activeBorrows.length > 0) {
    return new Response(
      JSON.stringify({ 
        error: 'Cannot deactivate student with active borrowed books',
        active_books: activeBorrows.map((borrow: any) => borrow.books.title)
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Cancel active reservations
  await supabaseClient
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('user_id', studentId)
    .eq('status', 'active');

  // Update student role to inactive (or delete if preferred)
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ 
      role: 'inactive_student',
      updated_at: new Date().toISOString()
    })
    .eq('id', studentId)
    .select()
    .single();

  if (error) {
    console.error('Deactivate student error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Student deactivated successfully', student: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAllStudents(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('last_name');

  if (error) {
    console.error('Get students error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ students: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getStudentActivity(supabaseClient: any, studentId: string) {
  console.log('Getting student activity for:', studentId);
  
  // Get borrowing history with copy_id
  const { data: borrowingHistory } = await supabaseClient
    .from('borrowing_records')
    .select(`
      id,
      borrowed_at,
      due_date,
      returned_at,
      status,
      fine_amount,
      copy_id,
      books:book_id (
        id,
        title,
        author
      )
    `)
    .eq('user_id', studentId)
    .order('borrowed_at', { ascending: false });

  // Get reservation history
  const { data: reservationHistory } = await supabaseClient
    .from('reservations')
    .select(`
      id,
      reserved_at,
      expires_at,
      status,
      books:book_id (
        id,
        title,
        author
      )
    `)
    .eq('user_id', studentId)
    .order('reserved_at', { ascending: false });

  return new Response(
    JSON.stringify({ 
      borrowing_history: borrowingHistory || [],
      reservation_history: reservationHistory || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}