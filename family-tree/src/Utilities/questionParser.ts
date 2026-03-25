// src/Utilities/questionParser.ts

/**
 * 從問題文字中提取 [] 括號內的內容
 * 例：「[爸爸]是[我]的誰？」→ ['爸爸', '我']
 */
export function extractPersonsFromQuestion(text: string): string[] {
  const matches = text.match(/\[([^\]]+)\]/g);
  
  if (!matches) return [];
  
  return matches.map(m => m.replace(/[\[\]]/g, ''));
}

/**
 * 將問題模板替換成實際人名
 * 例：「[]是[]的誰？」+ ['爸爸', '我'] → 「爸爸是我的誰？」
 */
export function fillQuestionTemplate(template: string, persons: string[]): string {
  let result = template;
  let index = 0;
  
  result = result.replace(/\[\]/g, () => {
    if (index < persons.length) {
      return persons[index++];
    }
    return '[]';
  });
  
  return result;
}

/**
 * 分析問題類型和關鍵詞
 */
export function analyzeQuestion(text: string): {
  type: 'relation' | 'age' | 'name' | 'count' | 'birthday' | 'unknown';
  persons: string[];
} {
  const persons = extractPersonsFromQuestion(text);
  
  // 關係問題：「A 是 B 的誰？」
  if (text.includes('是') && text.includes('的誰')) {
    return { type: 'relation', persons };
  }
  
  // 年齡比較：「A 會不會比 B 大？」
  if (text.includes('會不會比') && text.includes('大')) {
    return { type: 'age', persons };
  }
  
  // 名字問題：「A 的...叫什麼名字？」
  if (text.includes('叫什麼名字') || text.includes('名字是')) {
    return { type: 'name', persons };
  }
  
  // 數量問題：「A 有幾個...？」
  if (text.includes('有幾個') || text.includes('幾個')) {
    return { type: 'count', persons };
  }
  
  // 生日問題：「A 的生日是？」
  if (text.includes('生日')) {
    return { type: 'birthday', persons };
  }
  
  return { type: 'unknown', persons };
}

/**
 * 從問題中提取關係類型
 * 例：「爸爸的外公叫什麼名字？」→ '外公'
 */
export function extractRelationType(text: string): string | null {
  const relations = [
    '爸爸', '媽媽', '爺爺', '奶奶', '外公', '外婆',
    '兒子', '女兒', '哥哥', '弟弟', '姐姐', '妹妹',
    '丈夫', '妻子', '配偶', '老公', '老婆',
    '叔叔', '阿姨', '舅舅', '姑姑'
  ];
  
  for (const rel of relations) {
    if (text.includes(rel)) {
      return rel;
    }
  }
  
  return null;
}