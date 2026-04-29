-- 20240521000000_albrighty_academy_updates.sql

-- 1. Rename/Ensure School exists as "Albrighty Academy"
INSERT INTO public.schools (id, name, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Albrighty Academy', 'Addis Ababa, Ethiopia')
ON CONFLICT (id) DO UPDATE SET name = 'Albrighty Academy';

-- 2. Enhanced Admin CRUD on Profiles
-- Drop existing select policy to recreate it with all actions
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins have full access to all profiles"
ON public.profiles FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

-- 3. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    max_points INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage assignments"
ON public.assignments FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

CREATE POLICY "Students can view assignments"
ON public.assignments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.students WHERE profile_id = auth.uid() AND (class_id = assignments.class_id OR assignments.class_id IS NULL)));

-- 4. SUBMISSIONS (Student active participation)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    content_url TEXT, -- Link to document in storage
    submission_text TEXT,
    status TEXT CHECK (status IN ('submitted', 'graded', 'late', 'pending')) DEFAULT 'submitted',
    grade NUMERIC(5,2),
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own submissions"
ON public.submissions FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view and grade submissions"
ON public.submissions FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

-- 5. DOCUMENTS (General resources)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT, -- e.g., 'syllabus', 'lecture_note', 'student_work'
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE SET NULL, -- if specific to a student
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage all documents"
ON public.documents FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

CREATE POLICY "Students can view relevant documents"
ON public.documents FOR SELECT
USING (
    (student_id = auth.uid()) OR 
    (class_id IN (SELECT class_id FROM public.students WHERE profile_id = auth.uid())) OR
    (class_id IS NULL AND student_id IS NULL)
);

-- 6. NOTIFICATIONS (Communication between roles)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'attendance', 'grade', 'announcement', 'alert'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Users can send notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 7. ASSESSMENTS (Granular than exams)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_type TEXT, -- 'quiz', 'class_work', 'homework'
    max_marks NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage assessments"
ON public.assessments FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

CREATE POLICY "Students can view assessment marks"
ON public.assessment_marks FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage assessment marks"
ON public.assessment_marks FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

-- 8. Enable Admin CRUD on other tables
CREATE POLICY "Admins have full access to all tables"
ON public.students FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

CREATE POLICY "Admins have full access to teachers"
ON public.teachers FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));