-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policy that references profiles within profiles
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Staff can view all profiles" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.id IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('librarian', 'admin')
    )
  )
);

-- Also create the admin user directly
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'antonygmurimi@gmail.com',
  crypt('Am0718914148', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Admin", "last_name": "User", "role": "admin"}'::jsonb,
  false
) ON CONFLICT (email) DO NOTHING;

-- Update existing profile to admin if it exists
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'antonygmurimi@gmail.com';