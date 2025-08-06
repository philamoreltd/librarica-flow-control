-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Add department_id to existing tables
ALTER TABLE public.profiles ADD COLUMN department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.books ADD COLUMN department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.borrowing_records ADD COLUMN department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.reservations ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX idx_books_department_id ON public.books(department_id);
CREATE INDEX idx_borrowing_records_department_id ON public.borrowing_records(department_id);
CREATE INDEX idx_reservations_department_id ON public.reservations(department_id);

-- Create function to get user's department
CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT role = 'super_admin' FROM public.profiles WHERE id = auth.uid();
$$;

-- Create function to check if user is department admin for a specific department
CREATE OR REPLACE FUNCTION public.is_department_admin(dept_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT role = 'department_admin' AND department_id = dept_id 
  FROM public.profiles WHERE id = auth.uid();
$$;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for departments table
CREATE POLICY "Super admins can view all departments" 
ON public.departments FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "Department admins can view their department" 
ON public.departments FOR SELECT 
USING (public.is_department_admin(id));

CREATE POLICY "Staff can view their department" 
ON public.departments FOR SELECT 
USING (id = public.get_current_user_department());

CREATE POLICY "Super admins can manage all departments" 
ON public.departments FOR ALL 
USING (public.is_super_admin());

-- Update existing RLS policies for department isolation
-- Profiles policies
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "Department admins can view department profiles" 
ON public.profiles FOR SELECT 
USING (public.is_department_admin(department_id));

CREATE POLICY "Staff can view department profiles" 
ON public.profiles FOR SELECT 
USING (
  department_id = public.get_current_user_department() 
  AND get_current_user_role() = ANY(ARRAY['librarian'::text, 'admin'::text])
);

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Books policies
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
DROP POLICY IF EXISTS "Only staff can modify books" ON public.books;

CREATE POLICY "Anyone can view books in their department" 
ON public.books FOR SELECT 
USING (
  department_id = public.get_current_user_department() 
  OR public.is_super_admin()
);

CREATE POLICY "Super admins can manage all books" 
ON public.books FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Department admins can manage department books" 
ON public.books FOR ALL 
USING (public.is_department_admin(department_id));

CREATE POLICY "Staff can manage department books" 
ON public.books FOR ALL 
USING (
  department_id = public.get_current_user_department() 
  AND get_current_user_role() = ANY(ARRAY['librarian'::text, 'admin'::text])
);

-- Borrowing records policies  
DROP POLICY IF EXISTS "Staff can manage borrowing records" ON public.borrowing_records;
DROP POLICY IF EXISTS "Staff can view all borrowing records" ON public.borrowing_records;
DROP POLICY IF EXISTS "Users can view their own borrowing records" ON public.borrowing_records;

CREATE POLICY "Super admins can manage all borrowing records" 
ON public.borrowing_records FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Department admins can manage department borrowing records" 
ON public.borrowing_records FOR ALL 
USING (public.is_department_admin(department_id));

CREATE POLICY "Staff can manage department borrowing records" 
ON public.borrowing_records FOR ALL 
USING (
  department_id = public.get_current_user_department() 
  AND get_current_user_role() = ANY(ARRAY['librarian'::text, 'admin'::text])
);

CREATE POLICY "Users can view their own borrowing records" 
ON public.borrowing_records FOR SELECT 
USING (user_id = auth.uid());

-- Reservations policies
DROP POLICY IF EXISTS "Staff can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;

CREATE POLICY "Super admins can manage all reservations" 
ON public.reservations FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Department admins can manage department reservations" 
ON public.reservations FOR ALL 
USING (public.is_department_admin(department_id));

CREATE POLICY "Staff can manage department reservations" 
ON public.reservations FOR ALL 
USING (
  department_id = public.get_current_user_department() 
  AND get_current_user_role() = ANY(ARRAY['librarian'::text, 'admin'::text])
);

CREATE POLICY "Users can view their own reservations" 
ON public.reservations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create reservations in their department" 
ON public.reservations FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND department_id = public.get_current_user_department()
);