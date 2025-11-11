import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, departmentId, departmentName } = await req.json();

    console.log('Creating department admin for:', email, 'department:', departmentName);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log('User already exists:', existingUser.id);
      userId = existingUser.id;
      
      // Update their profile to be department admin
      await supabaseAdmin
        .from('profiles')
        .update({
          role: 'department_admin',
          department_id: departmentId
        })
        .eq('id', userId);
    } else {
      // Create new user with department_admin role
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          first_name: departmentName,
          last_name: 'Admin',
          role: 'department_admin',
          department_id: departmentId
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      userId = newUser.user.id;
      console.log('Created new user:', userId);
    }

    // Send password reset email for first-time setup
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('https://wkosluvoipdyjmeupksg.supabase.co', window.location?.origin || 'http://localhost:5173')}/`
      }
    });

    if (resetError) {
      console.error('Error sending password reset email:', resetError);
      throw resetError;
    }

    console.log('Password setup email sent to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Department admin account created. Password setup email sent.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-department-admin:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
