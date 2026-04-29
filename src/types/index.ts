export type UserRole = 'super_admin' | 'school_admin' | 'accountant' | 'teacher' | 'student' | 'parent';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export interface Student {
  profile_id: string;
  full_name?: string;
  admission_number: string;
  class_id?: string;
  section_id?: string;
  parent_id?: string;
  enrollment_date: string;
  status?: 'active' | 'inactive';
}

export interface Teacher {
  profile_id: string;
  specialization?: string;
  employee_id: string;
  full_name?: string;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  teacher_id?: string; // Class teacher
  school_id: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  school_id: string;
  teacher_id?: string;
}

export interface Assignment {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id?: string;
  class_id?: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content_url?: string;
  submission_text?: string;
  status: 'submitted' | 'graded' | 'late' | 'pending';
  grade?: number;
  feedback?: string;
  submitted_at: string;
}

export interface Document {
  id: string;
  school_id: string;
  uploader_id: string;
  title: string;
  file_url: string;
  category?: string;
  class_id?: string;
  student_id?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  sender_id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Assessment {
  id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  assessment_type: string;
  max_marks: number;
}

export interface AssessmentMark {
  id: string;
  assessment_id: string;
  student_id: string;
  marks_obtained: number;
  remarks?: string;
}

export interface OnlineExam {
  id: string;
  school_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  total_marks: number;
  created_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: any;
  correct_answer?: string;
  points: number;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  answers: any;
  score?: number;
  started_at: string;
  submitted_at?: string;
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface Invoice {
  id: string;
  invoice_number: string;
  student_name?: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  attendanceRate: number;
}

export interface SchoolSetting {
  id: string;
  key: string;
  value: string;
}