export type QuestionType = "select" | "fill" | "number" | "date";

export type GameQuestion = {
  id?: string;
  text: string;      // "[]是[]的誰？"
  type: QuestionType;
  option: string[];  // select 用
  slots: string[];   // 依序填到 []
  targetRelation?: string; // Phase 1 tree building relation
  attrKey?: string;        // Attribute to store the answer (e.g. birthday, name)
  targetPersonName?: string; // Phase 1 dynamic linking (e.g. child name linking to bday)
  metadata?: Record<string, any>; // Hidden triggers mapping
};

export type GameAnswer =
  | { type: "select"; value: string }
  | { type: "fill"; value: string }
  | { type: "number"; value: number | "" }
  | { type: "date"; value: string };
