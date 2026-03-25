import fs from 'fs';
import path from 'path';
import type { Data } from './Data';

// Load the CFG rules statically
const cfgPath = path.join(__dirname, '../../cfg_relation.json');
let cfgRules: Record<string, string> = {};
try {
  cfgRules = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
} catch (e) {
  console.warn("Could not load cfg_relation.json, CFG inference will be disabled.");
}

/**
 * Apply CFG rules to a list of relations to deduce implicit relationships.
 * Finds paths of length 2 (A -> B -> C) and checks if the combination of 
 * (A->B, B->C) exists in the CFG.
 * 
 * E.g., if A's "爸爸" is B, and B's "爸爸" is C, and "爸爸,爸爸" = "爺爺",
 * it returns a new relation: A's "爺爺" is C.
 * 
 * @param existingData The current list of known relations
 * @returns An array of newly discovered relations
 */
export function inferRelations(existingData: Data[]): Data[] {
  const newRelations: Data[] = [];
  const knownEdges = new Set<string>();

  // Map to easily look up out-edges from any node: node -> [ { relation, target } ]
  const graph = new Map<string, { relation: string; b: string; answerer: string }[]>();

  existingData.forEach(d => {
    // We only reason over named nodes, not placeholders
    if (d.a.startsWith('未知') || d.b.startsWith('未知')) return;
    
    // For CFG, we standardise relation names slightly to match the JSON keys
    const r = d.relation.replace(/父親/g, '爸爸').replace(/母親/g, '媽媽')
      .replace(/老公/g, '丈夫').replace(/老婆/g, '妻子');

    if (!graph.has(d.a)) graph.set(d.a, []);
    graph.get(d.a)!.push({ relation: r, b: d.b, answerer: d.answerer });
    
    // Hash existing edge to prevent duplicates
    knownEdges.add(`${d.a}|${r}|${d.b}`);
  });

  // Find paths of length 2
  for (const [a, outEdges] of graph.entries()) {
    for (const edge1 of outEdges) {
      const b = edge1.b;
      const r1 = edge1.relation;

      const bOutEdges = graph.get(b) || [];
      for (const edge2 of bOutEdges) {
        const c = edge2.b;
        const r2 = edge2.relation;

        // E.g. A is B's child, B is C's parent => A and C might be siblings. 
        // But our CFG is usually directional from subject -> target. 
        // Example: a's 爸爸 is b; b's 爸爸 is c.
        // Rule: "爸爸,爸爸"
        const ruleKey = `${r1},${r2}`;
        const derivedRelation = cfgRules[ruleKey];

        if (derivedRelation) {
          // If a == c, it's a loop (e.g. 丈夫,妻子 => self), skip.
          if (a === c) continue;

          const edgeHash = `${a}|${derivedRelation}|${c}`;
          if (!knownEdges.has(edgeHash)) {
            newRelations.push({
              relation: derivedRelation,
              a: a,
              b: c,
              answerer: 'system_cfg'
            });
            knownEdges.add(edgeHash);
            
            // Note: In a fully recursive engine, we would add this new edge 
            // back into `graph` to find 3rd degree (path of length 3).
            // For now, running 1 pass of inference depth=2 is usually enough 
            // because game data is built incrementally, so every time a node is added,
            // we infer length=2, which mathematically chains up to N degrees eventually.
          }
        }
      }
    }
  }

  return newRelations;
}
