import { useMemo } from "react";
import { useExamResults } from "./use-exam-results";

export interface ProgressPoint {
  date: string;
  exam_name: string;
  net: number;
  correct: number;
  incorrect: number;
  empty: number;
}

export interface SubjectProgress {
  subject_id: string;
  subject_name: string;
  score: number;
  points: ProgressPoint[];
}

export interface CategoryProgress {
  category: string;
  subjects: SubjectProgress[];
}

export type ViewType = "general" | "branch" | "official";

export function useProgressData(
  studentId: string,
  viewType: ViewType,
  showOfficial: boolean,
) {
  const { results, loading } = useExamResults(studentId);

  const data = useMemo(() => {
    const filtered = results.filter((r) => {
      if (viewType === "general")
        return !r.is_standalone && (showOfficial || !r.is_official);
      if (viewType === "branch")
        return r.is_standalone && (showOfficial || !r.is_official);
      if (viewType === "official") return r.is_official;
      return false;
    });

    const categoryMap = new Map<string, Map<string, SubjectProgress>>();

    for (const result of filtered) {
      if (!categoryMap.has(result.category)) {
        categoryMap.set(result.category, new Map());
      }
      const subjectMap = categoryMap.get(result.category);

      for (const subject of result.subjects) {
        if (!subjectMap?.has(subject.subject_id)) {
          subjectMap?.set(subject.subject_id, {
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            score: result.total_score,
            points: [],
          });
        }
        subjectMap?.get(subject.subject_id)?.points.push({
          date: result.exam_date,
          exam_name: result.exam_name,
          net: subject.net,
          correct: subject.correct,
          incorrect: subject.incorrect,
          empty: subject.empty,
        });
      }
    }

    const output: CategoryProgress[] = [];
    for (const [category, subjectMap] of categoryMap.entries()) {
      const subjects = Array.from(subjectMap.values()).map((s) => ({
        ...s,
        points: [...s.points].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }));
      output.push({ category, subjects });
    }
    output.sort((a, b) => a.category.localeCompare(b.category));
    return output;
  }, [results, viewType, showOfficial]);

  return { data, loading };
}
