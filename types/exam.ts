export interface SubjectResult {
  subject_name: string;
  correct: number;
  wrong: number;
  empty: number;
  net: number;
  sort_order: number;
}

export interface ExamResult {
  id: string;
  exam_name: string;
  exam_date: string;
  subjects: SubjectResult[];
  total_correct: number;
  total_wrong: number;
  total_empty: number;
  total_net: number;
}
