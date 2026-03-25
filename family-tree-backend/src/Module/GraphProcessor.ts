// Module/GraphProcessor.ts
import type { Data } from "./Data";

// 定義 React Flow 需要的結構
type ReactFlowNode = {
  id: string;
  data: { label: string; answerer?: string }; // 可以放回答者資訊
  position: { x: number; y: number }; // 後端給 0,0，讓前端用 Dagre 排版
  type?: string;
  className?: string; // 直接給 Tailwind 樣式
};

type ReactFlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string; // 'default' | 'step' | 'smoothstep'
  animated?: boolean;
  style?: any;
  markerEnd?: any;
};

// 關係設定檔：定義線條顏色、方向、類型
const RELATION_CONFIG: Record<string, { reverse: boolean; color: string; type: 'parent' | 'spouse' }> = {
'爸爸': { reverse: true, color: '#3b82f6', type: 'parent' }, // b(源) -> a(目)
  '媽媽': { reverse: true, color: '#ec4899', type: 'parent' }, // b(源) -> a(目)
  '丈夫': { reverse: false, color: '#6366f1', type: 'spouse' },
  '妻子': { reverse: false, color: '#f43f5e', type: 'spouse' },
  '配偶': { reverse: false, color: '#8b5cf6', type: 'spouse' },
};

export function generateGraphData(dataList: Data[]) {
  const nodesMap = new Map<string, ReactFlowNode>();
  const edges: ReactFlowEdge[] = [];

  dataList.forEach((d, index) => {
    // 1. 建立節點 (Nodes) - 確保不重複
    [d.a, d.b].forEach((name) => {
      if (!nodesMap.has(name)) {
        nodesMap.set(name, {
          id: name,
          data: { label: name },
          position: { x: 0, y: 0 }, // 初始化座標，前端負責排版
          // 預設樣式：圓角、陰影、白色背景
          className: "px-4 py-2 rounded-lg shadow-md bg-white border-2 border-slate-200 text-slate-700 font-bold min-w-[80px] text-center",
        });
      }
    });

    // 2. 建立連線 (Edges)
    const config = RELATION_CONFIG[d.relation] || { reverse: false, color: '#94a3b8', type: 'parent' };
    
    // 處理方向：如果是「爸爸」，資料是 A 爸爸 B (B是爸爸)，所以箭頭應該是 B -> A
    const source = config.reverse ? d.b : d.a;
    const target = config.reverse ? d.a : d.b;

    edges.push({
      id: `e-${index}-${source}-${target}`, // 確保 ID 唯一
      source: source,
      target: target,
      label: d.relation,
      type: config.type === 'spouse' ? 'step' : 'default', // 配偶用階梯線，親子用直線
      style: { stroke: config.color, strokeWidth: 2 },
      markerEnd: config.type === 'parent' ? { type: 'arrowclosed', color: config.color } : undefined, // 只有親子有箭頭
      animated: false,
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges: edges,
  };
}