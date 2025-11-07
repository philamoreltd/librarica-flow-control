-- Fix RLS policies to handle null department_ids properly

-- Drop existing policies for books
DROP POLICY IF EXISTS "Anyone can view books in their department" ON public.books;
DROP POLICY IF EXISTS "Department admins can manage department books" ON public.books;
DROP POLICY IF EXISTS "Staff can manage department books" ON public.books;

-- Create updated policies for books that handle null department_ids
CREATE POLICY "Anyone can view books in their department or null department"
ON public.books
FOR SELECT
USING (
  (department_id = get_current_user_department() OR (department_id IS NULL AND get_current_user_department() IS NULL))
  OR is_super_admin()
  OR get_current_user_role() = 'admin'
);

CREATE POLICY "Department admins can manage department books"
ON public.books
FOR ALL
USING (is_department_admin(department_id));

CREATE POLICY "Staff can manage department books"
ON public.books
FOR ALL
USING (
  (department_id = get_current_user_department() OR (department_id IS NULL AND get_current_user_department() IS NULL))
  AND (get_current_user_role() = ANY (ARRAY['librarian'::text, 'admin'::text]))
);

CREATE POLICY "Super admins and admins can manage all books"
ON public.books
FOR ALL
USING (is_super_admin() OR get_current_user_role() = 'admin');

-- Fix RLS policies for book_copies
DROP POLICY IF EXISTS "Anyone can view book copies in their department" ON public.book_copies;

CREATE POLICY "Anyone can view book copies in their department or null department"
ON public.book_copies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM books 
    WHERE books.id = book_copies.book_id 
    AND (
      (books.department_id = get_current_user_department() OR (books.department_id IS NULL AND get_current_user_department() IS NULL))
      OR is_super_admin()
      OR get_current_user_role() = 'admin'
    )
  )
);

-- Fix RLS policies for profiles
DROP POLICY IF EXISTS "Staff can view department profiles" ON public.profiles;

CREATE POLICY "Staff can view department profiles or null department"
ON public.profiles
FOR SELECT
USING (
  (department_id = get_current_user_department() OR (department_id IS NULL AND get_current_user_department() IS NULL))
  AND (get_current_user_role() = ANY (ARRAY['librarian'::text, 'admin'::text]))
);