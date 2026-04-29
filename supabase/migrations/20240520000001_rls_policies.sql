-- 20240520000001_rls_policies.sql

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

-- 2. SCHOOLS POLICIES
CREATE POLICY "Anyone can view school info"
ON public.schools FOR SELECT
TO authenticated
USING (true);

-- 3. CLASSES & SECTIONS
CREATE POLICY "School members can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (true);

-- 4. STUDENTS & TEACHERS
CREATE POLICY "Teachers can view students in their school"
ON public.students FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin', 'accountant')));

CREATE POLICY "Students can view their own data"
ON public.students FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Parents can view their children's data"
ON public.students FOR SELECT
USING (auth.uid() = parent_id);

-- 5. ATTENDANCE
CREATE POLICY "Teachers can mark attendance"
ON public.attendance FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

CREATE POLICY "Students/Parents can view their own attendance"
ON public.attendance FOR SELECT
USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.students WHERE profile_id = attendance.student_id AND parent_id = auth.uid()));

-- 6. FINANCE (Invoices & Payments)
CREATE POLICY "Accountants and Admins have full access to finance"
ON public.invoices FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('accountant', 'school_admin', 'super_admin')));

CREATE POLICY "Students can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.students WHERE profile_id = invoices.student_id AND parent_id = auth.uid()));

CREATE POLICY "Accountants can record payments"
ON public.payments FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('accountant', 'school_admin')));