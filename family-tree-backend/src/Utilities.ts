import fs from "node:fs";

type Question = {
  id?: string;
  text: string;
};

export function loadQuestion(path: string): string[] {
  const raw = fs.readFileSync(path, "utf-8");
  const json = JSON.parse(raw) as Question[];

  return json.map(q => q.text);
}
