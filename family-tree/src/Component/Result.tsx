// src/Result.tsx
import React, { useMemo } from 'react';
import * as ReactFamilyTreeModule from 'react-family-tree';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { parseDataToTree, type AttrsMap, type RawData } from '../Utilities/familyTreeParser';

// 處理 Vite 的套件引入相容性
const FamilyTreeComponent = (ReactFamilyTreeModule as any).default || ReactFamilyTreeModule;

// 📦 1. 隱形排版盒子 (負責接收 SVG 線條，必須大於卡片以產生間距)
const BOX_WIDTH = 220;  // 撐開左右間距
const BOX_HEIGHT = 140; // 👈 這裡改回 140，解決「上下黏在一起」的問題！

// 💳 2. 實體卡片 (負責顯示)
const CARD_WIDTH = 160;
const CARD_HEIGHT = 70;

type ResultProps = {
  roomCode: string;
  dataList: Array<{ relation: string; a: string; b: string; answerer?: string }>;
  attrsMap: AttrsMap;
  onHome: () => void;
};

export default function Result({ roomCode, dataList, attrsMap, onHome }: ResultProps) {
  const rawList: RawData[] = useMemo(
    () => dataList.map(d => ({ relation: d.relation, a: d.a, b: d.b })),
    [dataList]
  );

  const { nodes, rootIds } = useMemo(() => {
    return parseDataToTree(rawList, attrsMap);
  }, [rawList, attrsMap]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Family Tree - Room: {roomCode}</h3>
        <button 
          onClick={onHome} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Back Home
        </button>
      </div>

      <div className="w-full h-[600px] border border-gray-300 rounded-xl overflow-hidden bg-slate-50 relative shadow-inner">
        {nodes.length > 0 && rootIds && rootIds.length > 0 ? (
          <TransformWrapper initialScale={1} minScale={0.1} maxScale={3} centerOnInit={true} limitToBounds={false}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <React.Fragment>
                <div className="absolute top-3 right-3 z-[100] flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-600 font-bold" onClick={() => zoomIn()}>+</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-600 font-bold" onClick={() => zoomOut()}>-</button>
                  <button className="px-3 h-8 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-600 text-sm font-medium" onClick={() => resetTransform()}>Reset</button>
                </div>

                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                  <div className="p-10 md:p-20 flex flex-col items-center">
                    {rootIds.map((rId, index) => (
                      <div key={rId} className="relative w-full flex justify-center" style={{ marginTop: index > 0 ? 800 : 0, minHeight: 600 }}>
                        <FamilyTreeComponent
                          nodes={nodes as any}
                          rootId={rId}
                          width={BOX_WIDTH}
                          height={BOX_HEIGHT}
                          renderNode={(node: any) => {
                            const title = node.displayName ? `${node.displayName} (${node.id})` : node.id;
                            const sub = node.birthday ? `🎂 ${node.birthday}` : "";

                            const isMale = node.gender === 'male';
                            const genderClasses = isMale 
                              ? 'bg-blue-100 border-blue-500 text-slate-700' 
                              : 'bg-pink-100 border-pink-500 text-slate-700';

                            if (node.id === "__GLOBAL_ROOT__") {
                              return (
                                <div
                                  key={node.id}
                                  style={{
                                    width: BOX_WIDTH,
                                    height: BOX_HEIGHT,
                                    transform: `translate(${node.left * (BOX_WIDTH / 2)}px, ${node.top * (BOX_HEIGHT / 2)}px)`,
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                  }}
                                  className="pointer-events-none"
                                />
                              );
                            }

                            return (
                              <div
                                key={node.id}
                                style={{
                                  width: BOX_WIDTH,
                                  height: BOX_HEIGHT,
                                  transform: `translate(${node.left * (BOX_WIDTH / 2)}px, ${node.top * (BOX_HEIGHT / 2)}px)`,
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                }}
                                className="flex items-center justify-center"
                              >
                                <div
                                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                                  className={`flex flex-col items-center justify-center border-2 rounded-[10px] font-bold text-[13px] shadow-sm cursor-pointer p-1.5 text-center gap-1 hover:shadow-md transition-shadow ${genderClasses}`}
                                  title={title}
                                >
                                  <div className="truncate w-full">{title}</div>
                                  {sub && <div className="font-medium text-xs opacity-80">{sub}</div>}
                                </div>
                              </div>
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </TransformComponent>
              </React.Fragment>
            )}
          </TransformWrapper>
        ) : (
          <div className="p-5 text-gray-500 flex items-center justify-center h-full">
            No family data available.
          </div>
        )}
      </div>
    </div>
  );
}