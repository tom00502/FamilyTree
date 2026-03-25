// src/utils/familyQuery.ts
import type { FamilyNode } from "./familyTreeParser";

export function buildNodeIndex(nodes: FamilyNode[]) {
  const map = new Map<string, FamilyNode>();
  nodes.forEach(n => map.set(n.id, n));
  return map;
}

export function getFatherId(idx: Map<string, FamilyNode>, personId: string) {
  const n = idx.get(personId);
  if (!n) return null;
  const father = n.parents.map(p => idx.get(p.id)).find(p => p?.gender === "male");
  return father?.id ?? null;
}

export function getMotherId(idx: Map<string, FamilyNode>, personId: string) {
  const n = idx.get(personId);
  if (!n) return null;
  const mother = n.parents.map(p => idx.get(p.id)).find(p => p?.gender === "female");
  return mother?.id ?? null;
}

// 外公 = 媽媽的爸爸
export function getMaternalGrandfatherId(idx: Map<string, FamilyNode>, personId: string) {
  const motherId = getMotherId(idx, personId);
  if (!motherId) return null;
  return getFatherId(idx, motherId);
}

// 爺爺 = 爸爸的爸爸
export function getPaternalGrandfatherId(idx: Map<string, FamilyNode>, personId: string) {
  const fatherId = getFatherId(idx, personId);
  if (!fatherId) return null;
  return getFatherId(idx, fatherId);
}

// 兄弟姐妹數（共享任一父母）
export function countSiblings(idx: Map<string, FamilyNode>, personId: string) {
  const me = idx.get(personId);
  if (!me) return null;
  const parentIds = me.parents.map(p => p.id);
  const sib = new Set<string>();

  for (const pid of parentIds) {
    const p = idx.get(pid);
    if (!p) continue;
    for (const c of p.children) {
      if (c.id !== personId) sib.add(c.id);
    }
  }
  return sib.size;
}

// 生日比較：回傳 1 表示 a 比 b 大（更早出生），-1 表示小，0 相同/不可判
export function compareByBirthday(idx: Map<string, FamilyNode>, aId: string, bId: string) {
  const a = idx.get(aId);
  const b = idx.get(bId);
  if (!a?.birthday || !b?.birthday) return 0;

  // YYYY-MM-DD 字串可直接比較
  if (a.birthday < b.birthday) return 1;
  if (a.birthday > b.birthday) return -1;
  return 0;
}

// 輩分推導：如果 a 是 b 的祖先 => a 一定比較大（回傳 1）；反之 -1；未知 0
export function compareByAncestry(idx: Map<string, FamilyNode>, aId: string, bId: string) {
  const isAncestor = (anc: string, child: string) => {
    const visited = new Set<string>();
    const stack = [child];
    while (stack.length) {
      const cur = stack.pop()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      const node = idx.get(cur);
      if (!node) continue;
      for (const p of node.parents) {
        if (p.id === anc) return true;
        stack.push(p.id);
      }
    }
    return false;
  };

  if (isAncestor(aId, bId)) return 1;
  if (isAncestor(bId, aId)) return -1;
  return 0;
}

// 綜合比較：生日優先，否則用輩分
export function willABeOlderThanB(idx: Map<string, FamilyNode>, aId: string, bId: string): boolean | null {
  const byBd = compareByBirthday(idx, aId, bId);
  if (byBd === 1) return true;
  if (byBd === -1) return false;

  const byAnc = compareByAncestry(idx, aId, bId);
  if (byAnc === 1) return true;
  if (byAnc === -1) return false;

  return null; // 不可判
}
