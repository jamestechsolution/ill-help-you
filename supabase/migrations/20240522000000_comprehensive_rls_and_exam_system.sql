-- 20240522000000_comprehensive_rls_and_exam_system.sql

-- 1. ADMIN FULL ACCESS (Idempotent for all existing tables)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admin full access on %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Admin full access on %I" ON public.%I FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''super_admin'', ''school_admin'')))', t, t);
    END LOOP;
END $$;

-- 2. TEACHER PERMISSIONS
-- Results (Grades)
DROP POLICY IF EXISTS "Teachers can manage results" ON public.results;
CREATE POLICY "Teachers can manage results"
ON public.results FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Attendance (Ensure update/delete)
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;
CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

-- 3. STUDENT PERMISSIONS
-- View own results
DROP POLICY IF EXISTS "Students can view their own results" ON public.results;
CREATE POLICY "Students can view their own results"
ON public.results FOR SELECT
USING (auth.uid() = student_id);

-- 4. EXAM SYSTEM (Online Exam capability)
CREATE TABLE IF NOT EXISTS public.online_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    total_marks NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.online_exams ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.online_exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options JSONB, -- For multiple choice
    correct_answer TEXT,
    points NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.online_exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    answers JSONB, -- {question_id: answer}
    score NUMERIC(5,2),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('in_progress', 'submitted', 'graded')) DEFAULT 'in_progress'
);

ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES FOR ONLINE EXAMS
CREATE POLICY "Teachers can manage online exams"
ON public.online_exams FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

CREATE POLICY "Students can view online exams"
ON public.online_exams FOR SELECT
USING (true); -- Filter by school/class in frontend if needed, or refine here

CREATE POLICY "Teachers can manage exam questions"
ON public.exam_questions FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

CREATE POLICY "Students can view questions for exams"
ON public.exam_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.online_exams WHERE id = exam_id));

CREATE POLICY "Students can manage their own exam submissions"
ON public.exam_submissions FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view and grade exam submissions"
ON public.exam_submissions FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'school_admin')));

-- 6. NOTIFICATION SYSTEM TWEAKS
-- Ensure teachers can send notifications to anyone (including director)
DROP POLICY IF EXISTS "Users can send notifications" ON public.notifications;
CREATE POLICY "Users can send notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow recipients to update 'is_read'
DROP POLICY IF EXISTS "Recipients can mark as read" ON public.notifications;
CREATE POLICY "Recipients can mark as read"
ON public.notifications FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- 7. RE-VERIFY SCHOOL NAME
UPDATE public.schools SET name = 'Albrighty Academy' WHERE id = '00000000-0000-0000-0000-000000000001';