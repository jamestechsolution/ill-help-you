-- 20240520000002_seed_data.sql

-- Insert a sample school
INSERT INTO public.schools (id, name, address, phone, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Greenwood International School', '123 Education Ave, Addis Ababa', '+251911223344', 'info@greenwood.edu')
ON CONFLICT (id) DO NOTHING;

-- Insert sample classes
INSERT INTO public.classes (id, school_id, name, grade_level)
VALUES 
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Grade 10-A', 10),
('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Grade 11-B', 11)
ON CONFLICT (id) DO NOTHING;

-- Insert sample fee categories
INSERT INTO public.fee_categories (school_id, name, description, amount, currency)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Tuition Fee', 'Quarterly tuition fee', 5000.00, 'ETB'),
('00000000-0000-0000-0000-000000000001', 'Transport Fee', 'Monthly bus service', 1200.00, 'ETB'),
('00000000-0000-0000-0000-000000000001', 'Registration Fee', 'One-time admission fee', 2000.00, 'ETB')
ON CONFLICT DO NOTHING;

-- Insert sample subjects
INSERT INTO public.subjects (school_id, name, code)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Mathematics', 'MATH101'),
('00000000-0000-0000-0000-000000000001', 'Physics', 'PHYS101'),
('00000000-0000-0000-0000-000000000001', 'English Literature', 'ENG101')
ON CONFLICT DO NOTHING;