-- Enable realtime for borrowing_records table
ALTER TABLE public.borrowing_records REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.borrowing_records;

-- Enable realtime for reservations table  
ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

-- Enable realtime for profiles table (for student updates)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;