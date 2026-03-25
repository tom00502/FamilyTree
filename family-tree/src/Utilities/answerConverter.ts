// src/Utilities/answerConverter.ts

import type { RawData, AttrsMap } from './familyTreeParser';

export type QuestionType = 'select' | 'fill' | 'number' | 'date';

export interface GameQuestion {
  text: string;
  option: string[];
  type: QuestionType;
}

export interface GameAnswer {
  questionText: string;
  answer: string | number;
  // 如果題目有填充 []，這裡記錄實際的人名
  persons?: string[];
}

/**
 * 將問題和答案轉換成關係資料
 */
export function convertAnswerToRelation(
  question: GameQuestion,
  answer: string | number,
  persons: string[] // 題目中 [] 對應的實際人名
): { relations: RawData[]; attrs: Partial<AttrsMap> } {
  const relations: RawData[] = [];
  const attrs: Partial<AttrsMap> = {};
  const text = question.text;
  const [personA, personB] = persons;

  const createUnknown = (type: string, idSuffix: string) => `未知${type}_${idSuffix}`;

  if (text.includes('是') && text.includes('的誰')) {
    const relation = String(answer);

    if (['爸爸', '父親', '父'].includes(relation)) {
      relations.push({ relation: '爸爸', a: personB, b: personA });
      // 生成未知媽媽
      const unknownMom = createUnknown("媽媽", personB);
      relations.push({ relation: '媽媽', a: personB, b: unknownMom });
      relations.push({ relation: '配偶', a: personA, b: unknownMom });
    } else if (['媽媽', '母親', '母'].includes(relation)) {
      relations.push({ relation: '媽媽', a: personB, b: personA });
      // 生成未知爸爸
      const unknownDad = createUnknown("爸爸", personB);
      relations.push({ relation: '爸爸', a: personB, b: unknownDad });
      relations.push({ relation: '配偶', a: personA, b: unknownDad });
    } else if (['配偶', '老公', '老婆', '丈夫', '妻子'].includes(relation)) {
      relations.push({ relation: '配偶', a: personA, b: personB });
    } else {
      // 處理其他如爺爺奶奶
      if (['爺爺', '祖父'].includes(relation)) relations.push({ relation: '爺爺', a: personB, b: personA });
      else if (['外公', '外祖父'].includes(relation)) relations.push({ relation: '外公', a: personB, b: personA });
      else if (['奶奶', '祖母'].includes(relation)) relations.push({ relation: '奶奶', a: personB, b: personA });
      else if (['外婆', '外祖母'].includes(relation)) relations.push({ relation: '外婆', a: personB, b: personA });
      else if (['兄弟', '哥哥', '弟弟'].includes(relation)) relations.push({ relation: '兄弟', a: personA, b: personB });
      else if (['姐妹', '姐姐', '妹妹'].includes(relation)) relations.push({ relation: '姐妹', a: personA, b: personB });
    }
  } else if (text.includes('嗎')) {
    if (String(answer) === '是' || String(answer) === '對') {
      const relationMatch = text.match(/(爸爸|父親|媽媽|母親|配偶|老公|老婆|丈夫|妻子|爺爺|祖父|奶奶|祖母|外公|外祖父|外婆|外祖母|兒子|女兒|兄弟|姐妹|哥哥|弟弟|姐姐|妹妹)/);
      if (relationMatch) {
        let relation = relationMatch[1];
        // normalize relation here just to be safe
        if (['父親', '父'].includes(relation)) relation = '爸爸';
        else if (['母親', '母'].includes(relation)) relation = '媽媽';
        else if (['老公', '老婆', '丈夫', '妻子'].includes(relation)) relation = '配偶';
        else if (['祖父'].includes(relation)) relation = '爺爺';
        else if (['祖母'].includes(relation)) relation = '奶奶';
        else if (['外祖父'].includes(relation)) relation = '外公';
        else if (['外祖母'].includes(relation)) relation = '外婆';
        else if (['哥哥', '弟弟'].includes(relation)) relation = '兄弟';
        else if (['姐姐', '妹妹'].includes(relation)) relation = '姐妹';

        // A is B's relation => A=personA, B=personB
        relations.push({ relation, a: personB, b: personA });
      }
    }
  } else if (text.includes('叫什麼名字') || text.includes('名字') || text.includes('是誰')) {
    const name = String(answer);
    const relationMatch = text.match(/(爸爸|父親|媽媽|母親|配偶|老公|老婆|丈夫|妻子|爺爺|祖父|奶奶|祖母|外公|外祖父|外婆|外祖母|兒子|女兒)/);

    if (relationMatch) {
      const relation = relationMatch[1];
      if (['爸爸', '父親'].includes(relation)) relations.push({ relation: '爸爸', a: personA, b: name });
      else if (['媽媽', '母親'].includes(relation)) relations.push({ relation: '媽媽', a: personA, b: name });
      else if (['配偶', '老公', '老婆', '丈夫', '妻子'].includes(relation)) relations.push({ relation: '配偶', a: personA, b: name });
      else if (['爺爺', '祖父'].includes(relation)) relations.push({ relation: '爺爺', a: personA, b: name });
      else if (['奶奶', '祖母'].includes(relation)) relations.push({ relation: '奶奶', a: personA, b: name });
      else if (['外公', '外祖父'].includes(relation)) relations.push({ relation: '外公', a: personA, b: name });
      else if (['外婆', '外祖母'].includes(relation)) relations.push({ relation: '外婆', a: personA, b: name });
      else if (['兒子'].includes(relation)) relations.push({ relation: '兒子', a: personA, b: name });
      else if (['女兒'].includes(relation)) relations.push({ relation: '女兒', a: personA, b: name });

      if (!attrs[name]) attrs[name] = {};
      attrs[name].displayName = name;
    }
  } else if (text.includes('幾個小孩') || text.includes('幾個孩子')) {
    const numKids = parseInt(String(answer), 10);
    if (!isNaN(numKids) && numKids > 0) {
      for (let i = 1; i <= numKids; i++) {
        const unknownChild = createUnknown("小孩", `${personA}_${i}`);
        // 假設 personA 可能是爸爸或媽媽，先用一種通用的或先標記為爸爸
        relations.push({ relation: '爸爸', a: unknownChild, b: personA });
      }
    }
  } else if (text.includes('生日')) {
    const birthday = String(answer);
    if (!attrs[personA]) attrs[personA] = {};
    attrs[personA].birthday = birthday;
  }

  return { relations, attrs };
}