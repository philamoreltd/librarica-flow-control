-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can manage all departments" ON public.departments;
DROP POLICY IF EXISTS "Department admins can view their department" ON public.departments;
DROP POLICY IF EXISTS "Staff can view their department" ON public.departments;
DROP POLICY IF EXISTS "Super admins can view all departments" ON public.departments;

-- Allow super admins and admins to manage all departments
CREATE POLICY "Super admins and admins can manage all departments"
ON public.departments
FOR ALL
USING (is_super_admin() OR get_current_user_role() = 'admin');

-- Allow department admins to view and manage their department
CREATE POLICY "Department admins can manage their department"
ON public.departments
FOR ALL
USING (is_department_admin(id));

-- Allow staff to view their department
CREATE POLICY "Staff can view their department"
ON public.departments
FOR SELECT
USING (id = get_current_user_department());