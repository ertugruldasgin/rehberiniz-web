export interface SubjectResult {
  subject_name: string;
  correct: number;
  incorrect: number;
  empty: number;
  net: number;
}

export interface ExamResult {
  id: string;
  exam_name: string;
  exam_date: string;
  is_standalone: boolean;
  subjects: SubjectResult[];
  total_correct: number;
  total_incorrect: number;
  total_empty: number;
  total_net: number;
}
