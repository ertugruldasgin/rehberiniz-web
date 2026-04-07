import { useEffect, useState } from "react";
import type { ExamResult } from "@/types/exam";

// ——————————————————————————————————————————————
// Sahte veri — gerçek Supabase entegrasyonuna kadar kullanılacak
// ——————————————————————————————————————————————

const MOCK_SUBJECTS = ["Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler"];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockResults(): ExamResult[] {
  const exams = [
    { name: "TYT Deneme 1", date: "2026-01-15" },
    { name: "TYT Deneme 2", date: "2026-02-08" },
    { name: "TYT Deneme 3", date: "2026-02-22" },
    { name: "TYT Deneme 4", date: "2026-03-12" },
    { name: "TYT Deneme 5", date: "2026-03-29" },
  ];

  return exams.map((exam, idx) => {
    const subjects = MOCK_SUBJECTS.map((name, sortIdx) => {
      const totalQ = name === "Matematik" ? 40 : 20;
      const correct = randomBetween(Math.floor(totalQ * 0.3), totalQ);
      const wrong = randomBetween(0, totalQ - correct);
      const empty = totalQ - correct - wrong;
      const net = correct - wrong * 0.25;

      return {
        subject_name: name,
        correct,
        wrong,
        empty,
        net: parseFloat(net.toFixed(2)),
        sort_order: sortIdx,
      };
    });

    const total_correct = subjects.reduce((s, x) => s + x.correct, 0);
    const total_wrong = subjects.reduce((s, x) => s + x.wrong, 0);
    const total_empty = subjects.reduce((s, x) => s + x.empty, 0);
    const total_net = subjects.reduce((s, x) => s + x.net, 0);

    return {
      id: `mock-exam-${idx + 1}`,
      exam_name: exam.name,
      exam_date: exam.date,
      subjects,
      total_correct,
      total_wrong,
      total_empty,
      total_net: parseFloat(total_net.toFixed(2)),
    };
  });
}

// Sabit seed — her renderda aynı veriyi döndür
let _cachedResults: ExamResult[] | null = null;
function getMockResults(): ExamResult[] {
  if (!_cachedResults) {
    _cachedResults = generateMockResults();
  }
  return _cachedResults;
}

// ——————————————————————————————————————————————
// Öğrencinin kendi sonuçlarını çeken hook (student paneli)
// ——————————————————————————————————————————————
export function useMyExamResults() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sahte network gecikmesi
    const timer = setTimeout(() => {
      setResults(getMockResults());
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return { results, loading, error };
}

// ——————————————————————————————————————————————
// Belirli bir öğrencinin sonuçlarını çeken hook (öğretmen paneli)
// ——————————————————————————————————————————————
export function useExamResults(studentId: string) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Sahte network gecikmesi
    const timer = setTimeout(() => {
      setResults(getMockResults());
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [studentId]);

  return { results, loading, error };
}
