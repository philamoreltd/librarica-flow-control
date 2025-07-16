-- Update the user role to admin for antonygmurimi@gmail.com
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'antonygmurimi@gmail.com';