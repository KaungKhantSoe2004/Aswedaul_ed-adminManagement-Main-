export interface Salary {

    
}

export interface MarkRequest {
    exam_id: Number;
    subject_id: string;
    student_id: Number;
    note: string;
    marks: Number;
}

export interface Exam {
  id: number;
  exam_name: string;
  grade: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'unit_test';
  exam_start_date: string; // ISO date string (YYYY-MM-DD)
  exam_end_date: string;   // ISO date string (YYYY-MM-DD)
  created_by: number;
  status: 'scheduled' | 'ongoing' | 'completed';
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}


export type User = {
  id: number;
  name: string;
  role: string;
  email: string;
  age: string;
  phone: string;
  guardianPhone: string | null;
  guardianName: string | null;
  father_name: string | null;
  profile: string;
  class: string | null;
  grade: string;
  monthly_pay: string | number;
  gender: string;
  city: string;
  grade_id: string;
  prevClassDocument: string | null;
  created_at: string;
  updated_at: string;
};