-- Add missing fields to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add middle_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'middle_name') THEN
        ALTER TABLE public.profiles ADD COLUMN middle_name text;
    END IF;
    
    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_number text;
    END IF;
END $$;