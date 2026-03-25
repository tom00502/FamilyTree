// src/Utilities/familyTreeParser.ts

export type Gender = 'male' | 'female';
export type RelationType = 'blood' | 'married' | 'divorced' | 'adopted';

export interface FamilyNode {
  id: string;
  gender: Gender;
  parents: { id: string; type: RelationType }[];
  children: { id: string; type: RelationType }[];
  siblings: { id: string; type: RelationType }[];
  spouses: { id: string; type: RelationType }[];
  [key: string]: any;
}

export type RawData = {
  relation: string;
  a: string;
  b: string;
};

export type PersonAttrs = {
  displayName?: string;
  birthday?: string;
  gender?: Gender;
};

export type AttrsMap = Record<string, PersonAttrs>;

/**
 * 正規化關係名稱
 */
const normalizeRelation = (r: string) =>
  r
    .trim()
    .replace(/\s+/g, '')
    .replace(/父親/g, '爸爸')
    .replace(/母親/g, '媽媽')
    .replace(/老公/g, '丈夫')
    .replace(/老婆/g, '妻子')
    .replace(/祖父/g, '爺爺')
    .replace(/祖母/g, '奶奶')
    .replace(/外祖父/g, '外公')
    .replace(/外祖母/g, '外婆');

/**
 * 將原始關係資料轉換成家族樹節點
 */
export function parseDataToTree(dataList: RawData[], attrsMap: AttrsMap = {}) {
  const nodesMap = new Map<string, FamilyNode>();

  /**
   * 取得或建立節點
   */
  const getOrCreateNode = (id: string): FamilyNode => {
    if (!nodesMap.has(id)) {
      const attrs = attrsMap[id] ?? {};
      nodesMap.set(id, {
        id,
        gender: attrs.gender ?? 'male',
        parents: [],
        children: [],
        siblings: [],
        spouses: [],
        ...attrs,
      });
    } else {
      const node = nodesMap.get(id)!;
      const attrs = attrsMap[id] ?? {};
      if (attrs.gender) {
        node.gender = attrs.gender;
      }
      Object.assign(node, attrs);
    }
    return nodesMap.get(id)!;
  };

  /**
   * 檢查關係是否已存在
   */
  const hasRelation = (
    list: { id: string; type: RelationType }[],
    targetId: string
  ): boolean => {
    return list.some(item => item.id === targetId);
  };

  // ==========================================
  // 第一遍：建立基本關係（父母、子女、配偶）
  // ==========================================
  dataList.forEach(({ relation, a, b }) => {
    relation = normalizeRelation(relation);

    const nodeA = getOrCreateNode(a);
    const nodeB = getOrCreateNode(b);

    // 👨 爸爸/父親：A 的爸爸是 B
    if (['爸爸', '父'].includes(relation)) {
      nodeB.gender = 'male';
      if (!hasRelation(nodeA.parents, b)) nodeA.parents.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.children, a)) nodeB.children.push({ id: a, type: 'blood' });

      const realMotherId = dataList.find(d => d.a === a && ['媽媽', '母親', '母'].includes(normalizeRelation(d.relation)))?.b;
      if (realMotherId) {
        if (!hasRelation(nodeB.spouses, realMotherId)) nodeB.spouses.push({ id: realMotherId, type: 'married' });
        const motherNode = getOrCreateNode(realMotherId);
        if (!hasRelation(motherNode.spouses, b)) motherNode.spouses.push({ id: b, type: 'married' });
      }
    }
    // 👩 媽媽/母親：A 的媽媽是 B
    else if (['媽媽', '母'].includes(relation)) {
      nodeB.gender = 'female';
      if (!hasRelation(nodeA.parents, b)) nodeA.parents.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.children, a)) nodeB.children.push({ id: a, type: 'blood' });
      
      const realFatherId = dataList.find(d => d.a === a && ['爸爸', '父親', '父'].includes(normalizeRelation(d.relation)))?.b;
      if (realFatherId) {
        if (!hasRelation(nodeB.spouses, realFatherId)) nodeB.spouses.push({ id: realFatherId, type: 'married' });
      }
    }
    // 👴 爺爺：A 的爺爺是 B（父方祖父）
    else if (['爺爺'].includes(relation)) {
      nodeB.gender = 'male';
      const fatherId = dataList.find(d => d.a === a && ['爸爸', '父親', '父'].includes(normalizeRelation(d.relation)))?.b || `${a}_father`;
      const fatherNode = getOrCreateNode(fatherId);
      fatherNode.gender = 'male';
      fatherNode.displayName = fatherNode.displayName || `${a}的爸爸`;

      if (!hasRelation(nodeA.parents, fatherId)) nodeA.parents.push({ id: fatherId, type: 'blood' });
      if (!hasRelation(fatherNode.children, a)) fatherNode.children.push({ id: a, type: 'blood' });
      if (!hasRelation(fatherNode.parents, b)) fatherNode.parents.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.children, fatherId)) nodeB.children.push({ id: fatherId, type: 'blood' });

      const grandmaId = dataList.find(d => d.a === a && ['奶奶'].includes(normalizeRelation(d.relation)))?.b;
      if (grandmaId) {
        if (!hasRelation(nodeB.spouses, grandmaId)) nodeB.spouses.push({ id: grandmaId, type: 'married' });
      }
    }
    // 👵 奶奶：A 的奶奶是 B（父方祖母）
    else if (['奶奶'].includes(relation)) {
      nodeB.gender = 'female';
      const fatherId = dataList.find(d => d.a === a && ['爸爸', '父親', '父'].includes(normalizeRelation(d.relation)))?.b || `${a}_father`;
      const fatherNode = getOrCreateNode(fatherId);
      fatherNode.gender = 'male';
      fatherNode.displayName = fatherNode.displayName || `${a}的爸爸`;

      if (!hasRelation(nodeA.parents, fatherId)) nodeA.parents.push({ id: fatherId, type: 'blood' });
      if (!hasRelation(fatherNode.children, a)) fatherNode.children.push({ id: a, type: 'blood' });
      if (!hasRelation(fatherNode.parents, b)) fatherNode.parents.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.children, fatherId)) nodeB.children.push({ id: fatherId, type: 'blood' });
    }
    // 👴 外公：A 的外公是 B
    else if (['外公'].includes(relation)) {
      nodeB.gender = 'male';
      const motherId = dataList.find(d => d.a === a && ['媽媽', '母親', '母'].includes(normalizeRelation(d.relation)))?.b || `${a}_mother`;
      const motherNode = getOrCreateNode(motherId);
      motherNode.gender = 'female';
      motherNode.displayName = motherNode.displayName || `${a}的媽媽`;

      if (!hasRelation(nodeA.parents, motherId)) nodeA.parents.push({ id: motherId, type: 'blood' });
      if (!hasRelation(motherNode.children, a)) motherNode.children.push({ id: a, type: 'blood' });
      if (!hasRelation(motherNode.parents, b)) motherNode.parents.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.children, motherId)) nodeB.children.push({ id: motherId, type: 'blood' });

      const grandmaId = dataList.find(d => d.a === a && ['外婆'].includes(normalizeRelation(d.relation)))?.b;
      if (grandmaId) {
        if (!hasRelation(nodeB.spouses, grandmaId)) nodeB.spouses.push({ id: grandmaId, type: 'married' });
      }
    }
    // 👵 外婆：A 的外婆是 B
    else if (['外婆'].includes(relation)) {
      nodeB.gender = 'female';
      const motherId = dataList.find(d => d.a === a && ['媽媽', '母親', '母'].includes(normalizeRelation(d.relation)))?.b || `${a}_mother`;
      const motherNode = getOrCreateNode(motherId);
      motherNode.gender = 'female';
      motherNode.displayName = motherNode.displayName || `${a}的媽媽`;

      if (!hasRelation(nodeA.parents, motherId)) nodeA.parents.push({ id: motherId, type: 'blood' });
      if (!hasRelation(motherNode.children, a)) motherNode.children.push({ id: a, type: 'blood' });
      if (!hasRelation(motherNode.parents, b)) motherNode.parents.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.children, motherId)) nodeB.children.push({ id: motherId, type: 'blood' });
    }
    // 💑 丈夫：A 的丈夫是 B
    else if (['丈夫'].includes(relation)) {
      nodeA.gender = 'female'; 
      nodeB.gender = 'male';   
      if (!hasRelation(nodeA.spouses, b)) nodeA.spouses.push({ id: b, type: 'married' });
      if (!hasRelation(nodeB.spouses, a)) nodeB.spouses.push({ id: a, type: 'married' });
    }
    // 💑 妻子：A 的妻子是 B
    else if (['妻子'].includes(relation)) {
      nodeA.gender = 'male';   
      nodeB.gender = 'female'; 
      if (!hasRelation(nodeA.spouses, b)) nodeA.spouses.push({ id: b, type: 'married' });
      if (!hasRelation(nodeB.spouses, a)) nodeB.spouses.push({ id: a, type: 'married' });
    }
    // 💑 配偶
    else if (['配偶'].includes(relation)) {
      if (!hasRelation(nodeA.spouses, b)) nodeA.spouses.push({ id: b, type: 'married' });
      if (!hasRelation(nodeB.spouses, a)) nodeB.spouses.push({ id: a, type: 'married' });
    }
    // 👦 兒子
    else if (['兒子'].includes(relation)) {
      nodeB.gender = 'male';
      if (!hasRelation(nodeB.parents, a)) nodeB.parents.push({ id: a, type: 'blood' });
      if (!hasRelation(nodeA.children, b)) nodeA.children.push({ id: b, type: 'blood' });
    }
    // 👧 女兒
    else if (['女兒'].includes(relation)) {
      nodeB.gender = 'female';
      if (!hasRelation(nodeB.parents, a)) nodeB.parents.push({ id: a, type: 'blood' });
      if (!hasRelation(nodeA.children, b)) nodeA.children.push({ id: b, type: 'blood' });
    }
    // 👫 兄弟姊妹
    else if (['兄弟', '姐妹', '兄弟姐妹', '手足', '哥哥', '弟弟', '姐姐', '妹妹'].includes(relation)) {
      if (!hasRelation(nodeA.siblings, b)) nodeA.siblings.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.siblings, a)) nodeB.siblings.push({ id: a, type: 'blood' });
    }
    // 👴 叔伯姑 (爸爸的兄弟姐妹)
    else if (['叔叔', '伯伯', '姑姑', '阿伯', '阿姑', '叔伯姑'].includes(relation)) {
      const fatherId = dataList.find(d => d.a === a && ['爸爸', '父親', '父'].includes(normalizeRelation(d.relation)))?.b || `${a}_father`;
      const fatherNode = getOrCreateNode(fatherId);
      fatherNode.gender = 'male';
      fatherNode.displayName = fatherNode.displayName || `${a}的爸爸`;

      if (!hasRelation(nodeA.parents, fatherId)) nodeA.parents.push({ id: fatherId, type: 'blood' });
      if (!hasRelation(fatherNode.children, a)) fatherNode.children.push({ id: a, type: 'blood' });
      if (!hasRelation(fatherNode.siblings, b)) fatherNode.siblings.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.siblings, fatherId)) nodeB.siblings.push({ id: fatherId, type: 'blood' });
      
      if (['姑姑', '阿姑'].includes(relation)) nodeB.gender = 'female';
      else nodeB.gender = 'male';
    }
    // 👵 舅姨 (媽媽的兄弟姐妹)
    else if (['舅舅', '阿姨', '舅姨'].includes(relation)) {
      const motherId = dataList.find(d => d.a === a && ['媽媽', '母親', '母'].includes(normalizeRelation(d.relation)))?.b || `${a}_mother`;
      const motherNode = getOrCreateNode(motherId);
      motherNode.gender = 'female';
      motherNode.displayName = motherNode.displayName || `${a}的媽媽`;

      if (!hasRelation(nodeA.parents, motherId)) nodeA.parents.push({ id: motherId, type: 'blood' });
      if (!hasRelation(motherNode.children, a)) motherNode.children.push({ id: a, type: 'blood' });
      if (!hasRelation(motherNode.siblings, b)) motherNode.siblings.push({ id: b, type: 'blood' });
      if (!hasRelation(nodeB.siblings, motherId)) nodeB.siblings.push({ id: motherId, type: 'blood' });

      if (['阿姨'].includes(relation)) nodeB.gender = 'female';
      else nodeB.gender = 'male';
    }
  });

  // ==========================================
  // 第二遍：自動推算兄弟姊妹關係
  // ==========================================
  nodesMap.forEach(node => {
    if (node.parents.length === 0) return;
    nodesMap.forEach(otherNode => {
      if (otherNode.id === node.id || otherNode.parents.length === 0) return;
      const sharedParents = node.parents.filter(p => otherNode.parents.some(op => op.id === p.id));
      if (sharedParents.length > 0) {
        if (!hasRelation(node.siblings, otherNode.id)) {
          node.siblings.push({ id: otherNode.id, type: 'blood' });
        }
      }
    });
  });

  // ==========================================
  // 第三遍：推算配偶性別（根據子女）
  // ==========================================
  nodesMap.forEach(node => {
    if (node.spouses.length > 0 && node.children.length > 0) {
      node.spouses.forEach(spouse => {
        const spouseNode = nodesMap.get(spouse.id);
        if (!spouseNode) return;
        if (node.gender === 'male' && spouseNode.gender === 'male') spouseNode.gender = 'female';
        else if (node.gender === 'female' && spouseNode.gender === 'female') spouseNode.gender = 'male';
      });
    }
  });

  // ==========================================
  // 第四遍：自動推算配偶關係 (解決子孫消失的致命傷)
  // ==========================================
  nodesMap.forEach(node => {
    if (node.parents.length >= 2) {
      const p1Id = node.parents[0].id;
      const p2Id = node.parents[1].id;
      const p1 = nodesMap.get(p1Id);
      const p2 = nodesMap.get(p2Id);

      if (p1 && p2) {
        if (!hasRelation(p1.spouses, p2Id)) p1.spouses.push({ id: p2Id, type: 'married' });
        if (!hasRelation(p2.spouses, p1Id)) p2.spouses.push({ id: p1Id, type: 'married' });
      }
    }
  });

  // ==========================================
  // 第五遍：自動補齊單親的另一半父母 (畫出完美家庭線的關鍵)
  // ==========================================
  nodesMap.forEach(node => {
    // 如果這個小孩目前只有登記 1 個父母
    if (node.parents.length === 1) {
      const knownParentId = node.parents[0].id;
      const knownParent = nodesMap.get(knownParentId);

      // 如果已知的父母有配偶，自動把配偶當作小孩的另一個父母
      if (knownParent && knownParent.spouses.length > 0) {
        const stepParentId = knownParent.spouses[0].id;
        const stepParent = nodesMap.get(stepParentId);

        if (stepParent) {
          if (!hasRelation(node.parents, stepParentId)) {
            node.parents.push({ id: stepParentId, type: 'blood' });
          }
          if (!hasRelation(stepParent.children, node.id)) {
            stepParent.children.push({ id: node.id, type: 'blood' });
          }
        }
      }
    }
  });

  // ==========================================
  // 第六遍：移除循環依賴 (防止防護網：解決使用者輸入矛盾造成的無窮迴圈)
  // ==========================================
  const removeCycles = () => {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const dfs = (nodeId: string) => {
      if (visiting.has(nodeId)) return true; // Cycle detected
      if (visited.has(nodeId)) return false;

      visiting.add(nodeId);
      const node = nodesMap.get(nodeId);
      if (node) {
        const safeParents = [];
        for (const p of node.parents) {
          if (!dfs(p.id)) {
            safeParents.push(p);
          } else {
            console.warn(`Cycle detected and removed: ${nodeId} -> ${p.id}`);
            const parentNode = nodesMap.get(p.id);
            if (parentNode) {
              parentNode.children = parentNode.children.filter(c => c.id !== nodeId);
            }
          }
        }
        node.parents = safeParents;
      }
      visiting.delete(nodeId);
      visited.add(nodeId);
      return false;
    };

    nodesMap.forEach(node => {
      if (!visited.has(node.id)) dfs(node.id);
    });
  };
  removeCycles();

  // ==========================================
  // 組裝結果
  // ==========================================
  const nodes = Array.from(nodesMap.values());

  // 1. Find Weakly Connected Components
  const components: Set<string>[] = [];
  const visitedNodes = new Set<string>();

  nodes.forEach(startNode => {
    if (visitedNodes.has(startNode.id)) return;
    
    const comp = new Set<string>();
    const queue = [startNode.id];
    
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (comp.has(curr)) continue;
      comp.add(curr);
      visitedNodes.add(curr);
      
      const node = nodesMap.get(curr);
      if (!node) continue;
      
      node.parents.forEach(p => queue.push(p.id));
      node.children.forEach(c => queue.push(c.id));
      node.spouses.forEach(s => queue.push(s.id));
      node.siblings.forEach(s => queue.push(s.id));
    }
    components.push(comp);
  });

  // 2. Find best root for each component
  let rootIds: string[] = [];
  components.forEach(comp => {
    const compNodes = Array.from(comp).map(id => nodesMap.get(id)!);
    const compRoots = compNodes.filter(n => n.parents.length === 0);
    
    let bestRoot = compNodes[0];
    if (compRoots.length > 0) {
        bestRoot = compRoots.reduce((best, current) => {
            const bestDesc = countDescendants(best.id, nodesMap);
            const currDesc = countDescendants(current.id, nodesMap);
            return currDesc > bestDesc ? current : best;
        }, compRoots[0]);
    }
    rootIds.push(bestRoot.id);
  });

  // 3. (Removed Global Root wrapping implementation to prevent relatives-tree layout component crashes)
  // Instead, we let Result.tsx map natively over the multiple independent rootIds to vertically render independent components.

  const resultNodes = Array.from(nodesMap.values());
  return { nodes: resultNodes, rootIds, nodesMap };
}

function countDescendants(
  personId: string,
  nodesMap: Map<string, FamilyNode>,
  visited = new Set<string>()
): number {
  if (visited.has(personId)) return 0;
  visited.add(personId);

  const node = nodesMap.get(personId);
  if (!node) return 0;

  let count = node.children.length;
  node.children.forEach(child => {
    count += countDescendants(child.id, nodesMap, new Set(visited));
  });

  return count;
}

/**
 * 透過上下文無關語法 (CFG) 自動推導節點間的最短關係路徑
 */
export function inferRelationCFG(
  startId: string,
  endId: string,
  nodesMap: Map<string, FamilyNode>
): string {
  if (startId === endId) return '自己';

  const queue: [string, string[]][] = [[startId, []]];
  const visited = new Set<string>();
  visited.add(startId);

  let finalPath: string[] | null = null;

  while (queue.length > 0) {
    const [currId, path] = queue.shift()!;
    if (currId === endId) {
      finalPath = path;
      break;
    }

    const node = nodesMap.get(currId);
    if (!node) continue;

    const explore = (relType: string, relativeId: string) => {
      if (!visited.has(relativeId)) {
        visited.add(relativeId);
        const relNode = nodesMap.get(relativeId);
        if (relNode) {
          let token = relType;
          if (relType === 'parent') {
            token = relNode.gender === 'male' ? '爸爸' : (relNode.gender === 'female' ? '媽媽' : '父母');
          } else if (relType === 'child') {
            token = relNode.gender === 'male' ? '兒子' : (relNode.gender === 'female' ? '女兒' : '小孩');
          } else if (relType === 'sibling') {
            token = relNode.gender === 'male' ? '兄弟' : (relNode.gender === 'female' ? '姐妹' : '手足');
          } else if (relType === 'spouse') {
            token = relNode.gender === 'male' ? '丈夫' : (relNode.gender === 'female' ? '妻子' : '配偶');
          }
          queue.push([relativeId, [...path, token]]);
        }
      }
    };

    node.parents.forEach(p => explore('parent', p.id));
    node.children.forEach(c => explore('child', c.id));
    node.siblings.forEach(s => explore('sibling', s.id));
    node.spouses.forEach(s => explore('spouse', s.id));
  }

  if (!finalPath) return '親屬';

  let reduced = [...finalPath];
  let changed = true;
  
  const rules: Record<string, string> = {
    '爸爸+爸爸': '爺爺',
    '爸爸+媽媽': '奶奶',
    '媽媽+爸爸': '外公',
    '媽媽+媽媽': '外婆',
    '爸爸+兄弟': '叔伯',
    '爸爸+姐妹': '姑姑',
    '媽媽+兄弟': '舅舅',
    '媽媽+姐妹': '阿姨',
    '兄弟+兒子': '姪子',
    '兄弟+女兒': '姪女',
    '姐妹+兒子': '外甥',
    '姐妹+女兒': '外甥女',
    '叔伯+兒子': '堂兄弟',
    '叔伯+女兒': '堂姐妹',
    '姑姑+兒子': '表兄弟',
    '姑姑+女兒': '表姐妹',
    '舅舅+兒子': '表兄弟',
    '舅舅+女兒': '表姐妹',
    '阿姨+兒子': '表兄弟',
    '阿姨+女兒': '表姐妹',
    '兒子+兒子': '孫子',
    '兒子+女兒': '孫女',
    '女兒+兒子': '外孫',
    '女兒+女兒': '外孫女',
    '丈夫+爸爸': '公公',
    '丈夫+媽媽': '婆婆',
    '妻子+爸爸': '岳父',
    '妻子+媽媽': '岳母',
    '丈夫+兄弟': '小叔/大伯',
    '丈夫+姐妹': '小姑/大姑',
    '妻子+兄弟': '小舅/大舅',
    '妻子+姐妹': '小姨/大姨',
    '配偶+爸爸': '岳父/公公',
    '配偶+媽媽': '岳母/婆婆',
    '爸爸+妻子': '媽媽',
    '媽媽+丈夫': '爸爸',
    '兄弟+妻子': '嫂嫂/弟媳',
    '姐妹+丈夫': '姊夫/妹夫',
    '父親+兄弟': '叔伯'
  };

  while (changed && reduced.length > 1) {
    changed = false;
    for (let i = 0; i < reduced.length - 1; i++) {
      const p1 = reduced[i];
      const p2 = reduced[i+1];
      const key = `${p1}+${p2}`;
      
      if (rules[key]) {
        reduced.splice(i, 2, rules[key]);
        changed = true;
        break; 
      }
    }
  }

  return reduced.join('的');
}