-- Add institution field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN institution TEXT;