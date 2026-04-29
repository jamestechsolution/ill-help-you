-- 20240520000003_functions.sql

-- Function to calculate GPA for a student
CREATE OR REPLACE FUNCTION public.calculate_student_gpa(p_student_id UUID, p_exam_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_total_marks NUMERIC;
    v_total_max_marks NUMERIC;
    v_gpa NUMERIC;
BEGIN
    SELECT SUM(marks_obtained), SUM(max_marks)
    INTO v_total_marks, v_total_max_marks
    FROM public.results
    WHERE student_id = p_student_id AND exam_id = p_exam_id;

    IF v_total_max_marks > 0 THEN
        v_gpa := (v_total_marks / v_total_max_marks) * 4.0; -- Standard 4.0 scale
    ELSE
        v_gpa := 0;
    END IF;

    RETURN ROUND(v_gpa, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;