
-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'librarian', 'admin')) DEFAULT 'student',
  grade_level TEXT,
  student_id TEXT UNIQUE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create books table
CREATE TABLE public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  grade_level TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create borrowing records table
CREATE TABLE public.borrowing_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'returned', 'overdue')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('active', 'fulfilled', 'expired', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('librarian', 'admin')
    )
  );

-- Create RLS policies for books (public read access)
CREATE POLICY "Anyone can view books" ON public.books
  FOR SELECT USING (true);

CREATE POLICY "Only staff can modify books" ON public.books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('librarian', 'admin')
    )
  );

-- Create RLS policies for borrowing records
CREATE POLICY "Users can view their own borrowing records" ON public.borrowing_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all borrowing records" ON public.borrowing_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('librarian', 'admin')
    )
  );

CREATE POLICY "Staff can manage borrowing records" ON public.borrowing_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('librarian', 'admin')
    )
  );

-- Create RLS policies for reservations
CREATE POLICY "Users can view their own reservations" ON public.reservations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reservations" ON public.reservations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can view all reservations" ON public.reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('librarian', 'admin')
    )
  );

CREATE POLICY "Staff can manage reservations" ON public.reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('librarian', 'admin')
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample books
INSERT INTO public.books (title, author, category, description, grade_level, points, total_copies, available_copies) VALUES
('The Hunger Games', 'Suzanne Collins', 'Dystopian Fiction', 'A gripping tale of survival and rebellion in a dystopian future.', '9-12', 15, 3, 2),
('Wonder', 'R.J. Palacio', 'Contemporary Fiction', 'A heartwarming story about kindness, friendship, and acceptance.', '6-9', 12, 4, 4),
('The Hate U Give', 'Angie Thomas', 'Contemporary YA', 'A powerful story about finding your voice and standing up for what you believe in.', '9-12', 18, 2, 1),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', 'The magical beginning of Harry Potter''s journey at Hogwarts.', '6-12', 20, 5, 3),
('To Kill a Mockingbird', 'Harper Lee', 'Classic Literature', 'A timeless story about justice, morality, and growing up in the American South.', '9-12', 25, 3, 2),
('The Outsiders', 'S.E. Hinton', 'Coming of Age', 'A classic tale of friendship, loyalty, and finding your place in the world.', '7-10', 14, 4, 3),
('Speak', 'Laurie Halse Anderson', 'Contemporary YA', 'A powerful story about finding your voice after trauma.', '9-12', 16, 2, 2),
('The Book Thief', 'Markus Zusak', 'Historical Fiction', 'A beautiful and haunting story set during World War II.', '9-12', 22, 3, 1);
