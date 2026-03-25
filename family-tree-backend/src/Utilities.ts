import fs from "node:fs";

export type QuestionType = "select" | "fill" | "number" | "date";

export type QuestionTemplate = {
  id?: string;
  text: string;
  option: string[];
  type: QuestionType;
  targetRelation?: string;
  attrKey?: string;
};

export function loadQuestion(path: string): QuestionTemplate[] {
  const raw = fs.readFileSync(path, "utf-8");
  const json = JSON.parse(raw) as any[];

  // 基本防呆：缺欄位就補預設
  return json.map((q, i) => ({
    id: q.id ?? `q-${i}`,
    text: String(q.text ?? ""),
    type: (q.type ?? "fill") as QuestionType,
    option: Array.isArray(q.option) ? q.option.map(String) : [],
    targetRelation: q.targetRelation,
    attrKey: q.attrKey,
  }));
}
