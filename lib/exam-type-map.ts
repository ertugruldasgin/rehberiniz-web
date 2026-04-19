export const EXAM_TYPES = [
  "TYT",
  "AYT-SAY",
  "AYT-EA",
  "AYT-SÖZ",
  "LGS",
  "YDT",
] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  TYT: "TYT",
  "AYT-SAY": "AYT Sayısal",
  "AYT-EA": "AYT Eşit Ağırlık",
  "AYT-SÖZ": "AYT Sözel",
  LGS: "LGS",
  YDT: "YDT",
};

export const EXAM_TYPE_SUBJECT_SLUGS: Record<ExamType, string[]> = {
  TYT: [
    "tyt-turkce",
    "tyt-tarih",
    "tyt-cografya",
    "tyt-felsefe",
    "tyt-din",
    "tyt-matematik",
    "tyt-fizik",
    "tyt-kimya",
    "tyt-biyoloji",
  ],
  "AYT-SAY": ["ayt-matematik", "ayt-fizik", "ayt-kimya", "ayt-biyoloji"],
  "AYT-EA": ["ayt-matematik", "ayt-edebiyat", "ayt-tarih-1", "ayt-cografya-1"],
  "AYT-SÖZ": [
    "ayt-edebiyat",
    "ayt-tarih-1",
    "ayt-cografya-1",
    "ayt-tarih-2",
    "ayt-cografya-2",
    "ayt-felsefe",
    "ayt-din",
  ],
  LGS: [
    "lgs-turkce",
    "lgs-matematik",
    "lgs-fen",
    "lgs-inkilap",
    "lgs-din",
    "lgs-ingilizce",
  ],
  YDT: ["ydt-dil"],
};

export const SUBJECT_GROUPS: Record<string, string[]> = {
  "tyt-sosyal": ["tyt-tarih", "tyt-cografya", "tyt-felsefe", "tyt-din"],
  "tyt-fen": ["tyt-fizik", "tyt-kimya", "tyt-biyoloji"],
};

export const SLUG_TO_GROUP: Record<string, string> = {
  "tyt-tarih": "tyt-sosyal",
  "tyt-cografya": "tyt-sosyal",
  "tyt-felsefe": "tyt-sosyal",
  "tyt-din": "tyt-sosyal",
  "tyt-fizik": "tyt-fen",
  "tyt-kimya": "tyt-fen",
  "tyt-biyoloji": "tyt-fen",
};

export const EXAM_TYPE_SCORE_CONFIG: Record<
  ExamType,
  { base_score: number; max_score: number }
> = {
  TYT: { base_score: 100, max_score: 500 },
  "AYT-SAY": { base_score: 100, max_score: 500 },
  "AYT-EA": { base_score: 100, max_score: 500 },
  "AYT-SÖZ": { base_score: 100, max_score: 500 },
  LGS: { base_score: 200, max_score: 500 },
  YDT: { base_score: 100, max_score: 500 },
};
