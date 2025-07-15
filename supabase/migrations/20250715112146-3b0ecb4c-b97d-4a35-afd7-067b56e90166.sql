-- Fix infinite recursion in profiles RLS policies using security definer function
-- First create a security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;

-- Create a new policy using the security definer function
CREATE POLICY "Staff can view all profiles" ON public.profiles
FOR SELECT
USING (public.get_current_user_role() IN ('librarian', 'admin'));