import React, { useState } from 'react';
import { Share2, ZoomIn, ZoomOut, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ButtonSecondary } from '../button-secondary';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  birthYear?: string;
  x: number;
  y: number;
  connections?: string[]; // IDs of connected members
}

interface FamilyTreeResultPageProps {
  members: FamilyMember[];
  onShare: () => void;
  onPlayAgain: () => void;
}

export function FamilyTreeResultPage({ members, onShare, onPlayAgain }: FamilyTreeResultPageProps) {
  const navigate = useNavigate();
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>([]);
  const [zoom, setZoom] = useState(1);

  // 處理人物點擊 - 支援選擇兩個人
  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMembers((prev) => {
      // 如果已選擇此人，取消選擇
      if (prev.find(m => m.id === member.id)) {
        return prev.filter(m => m.id !== member.id);
      }
      
      // 如果已選擇兩人，替換第二個人
      if (prev.length === 2) {
        return [prev[0], member];
      }
      
      // 添加到選擇列表
      return [...prev, member];
    });
  };

  // 計算兩人之間的關係
  const getRelationshipBetween = (person1: FamilyMember, person2: FamilyMember): string => {
    // 這裡是簡化的關係判斷邏輯，實際應用中需要更複雜的關係圖算法
    const relations: { [key: string]: string } = {
      'you-father': '父子',
      'you-mother': '母子',
      'father-mother': '夫妻',
      'father-grandfather': '父子',
      'mother-grandmother': '母女',
      'you-brother': '兄弟',
      'you-sister': '姊妹',
      'grandfather-grandmother': '夫妻',
    };
    
    // 簡化的關係查找
    const key1 = `${person1.id}-${person2.id}`;
    const key2 = `${person2.id}-${person1.id}`;
    
    return relations[key1] || relations[key2] || '親屬關係';
  };

  // 獲取雙向關係（person1 對 person2 的稱謂 和 person2 對 person1 的稱謂）
  const getBidirectionalRelationship = (person1: FamilyMember, person2: FamilyMember): [string, string] => {
    // 定義雙向關係映射：key 是 'id1-id2'，value 是 [person1稱呼person2, person2稱呼person1]
    const bidirectionalRelations: { [key: string]: [string, string] } = {
      '1-2': ['兒子', '爸爸'],
      '1-3': ['兒子', '媽媽'],
      '2-3': ['丈夫', '妻子'],
      '2-4': ['兒子', '爸爸'],
      '2-5': ['兒子', '媽媽'],
      '3-6': ['女兒', '爸爸'],
      '3-7': ['女兒', '媽媽'],
      '4-5': ['丈夫', '妻子'],
      '6-7': ['丈夫', '妻子'],
      '1-4': ['孫子', '爺爺'],
      '1-5': ['孫子', '奶奶'],
      '1-6': ['外孫', '外公'],
      '1-7': ['外孫', '外婆'],
    };
    
    const key1 = `${person1.id}-${person2.id}`;
    const key2 = `${person2.id}-${person1.id}`;
    
    if (bidirectionalRelations[key1]) {
      return bidirectionalRelations[key1];
    } else if (bidirectionalRelations[key2]) {
      // 反轉順序
      return [bidirectionalRelations[key2][1], bidirectionalRelations[key2][0]];
    }
    
    // 默認值
    return ['親屬', '親屬'];
  };

  const isSelected = (memberId: string) => {
    return selectedMembers.some(m => m.id === memberId);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#8B2635] text-[#FAF8F3] p-4 flex justify-between items-center border-b-2 border-[#D4AF37]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/results')}
            className="p-2 hover:bg-[#6B1D28] rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[#FAF8F3]">家族樹</h2>
        </div>
        <button 
          onClick={onShare}
          className="p-2 hover:bg-[#6B1D28] rounded-md transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          className="p-2 bg-[#F5F1E8] border-2 border-[#8B2635] rounded-md hover:bg-[#EAE6DC]"
        >
          <ZoomIn className="w-5 h-5 text-[#8B2635]" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="p-2 bg-[#F5F1E8] border-2 border-[#8B2635] rounded-md hover:bg-[#EAE6DC]"
        >
          <ZoomOut className="w-5 h-5 text-[#8B2635]" />
        </button>
      </div>
      
      {/* Family Tree Canvas */}
      <div className="flex-1 overflow-auto relative">
        <div 
          className="min-w-full min-h-full p-8 relative"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* SVG for connection lines */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {members.map((member) =>
              member.connections?.map((targetId) => {
                const target = members.find((m) => m.id === targetId);
                if (!target) return null;
                
                return (
                  <line
                    key={`${member.id}-${targetId}`}
                    x1={member.x}
                    y1={member.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#C9A961"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })
            )}
          </svg>
          
          {/* Member nodes */}
          {members.map((member) => (
            <div
              key={member.id}
              className="absolute cursor-pointer"
              style={{
                left: member.x - 40,
                top: member.y - 40,
              }}
              onClick={() => handleMemberClick(member)}
            >
              <div className={`w-20 h-20 bg-[#F5F1E8] border-2 rounded-full flex items-center justify-center transition-all ${
                isSelected(member.id)
                  ? 'border-[#8B2635] shadow-lg scale-110' 
                  : 'border-[#C9A961] hover:border-[#8B2635]'
              }`}>
                <User className="w-10 h-10 text-[#8B2635]" />
              </div>
              <div className="text-xs text-center mt-1 text-[#5C2E2E] font-medium whitespace-nowrap">
                {member.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Info Panel - Relationship View */}
      {selectedMembers.length > 0 && (
        <div className="bg-[#F5F1E8] border-t-2 border-[#C9A961] p-6 space-y-4">
          {selectedMembers.length === 1 ? (
            // 單人模式
            <div className="space-y-2">
              <h3 className="text-[#5C2E2E]">{selectedMembers[0].name}</h3>
              <p className="text-[#8B8278]">{selectedMembers[0].relation}</p>
              {selectedMembers[0].birthYear && (
                <p className="text-sm text-[#8B8278]">出生年份：{selectedMembers[0].birthYear}</p>
              )}
            </div>
          ) : (
            // 雙人關係模式
            <div className="space-y-4">
              {/* 關係檢視面板 */}
              <div className="flex items-center gap-4">
                {/* Person Card A */}
                <div className="flex-1 bg-white/60 border border-[#C9A961] rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#8B2635]/10 border-2 border-[#C9A961] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#8B2635]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#5C2E2E] text-sm truncate">{selectedMembers[0].name}</h4>
                      <p className="text-xs text-[#8B8278] truncate">{selectedMembers[0].relation}</p>
                      {selectedMembers[0].birthYear && (
                        <p className="text-xs text-[#8B8278]">{selectedMembers[0].birthYear}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Relationship Indicator */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="flex gap-2 items-center">
                    <div className="bg-[#8B2635] text-[#FAF8F3] px-3 py-1 rounded-full text-xs whitespace-nowrap">
                      {getBidirectionalRelationship(selectedMembers[0], selectedMembers[1])[0]}
                    </div>
                    <div className="bg-[#8B2635] text-[#FAF8F3] px-3 py-1 rounded-full text-xs whitespace-nowrap">
                      {getBidirectionalRelationship(selectedMembers[0], selectedMembers[1])[1]}
                    </div>
                  </div>
                </div>
                
                {/* Person Card B */}
                <div className="flex-1 bg-white/60 border border-[#C9A961] rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#8B2635]/10 border-2 border-[#C9A961] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#8B2635]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#5C2E2E] text-sm truncate">{selectedMembers[1].name}</h4>
                      <p className="text-xs text-[#8B8278] truncate">{selectedMembers[1].relation}</p>
                      {selectedMembers[1].birthYear && (
                        <p className="text-xs text-[#8B8278]">{selectedMembers[1].birthYear}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 再玩一次按鈕 */}
          <ButtonSecondary fullWidth onClick={onPlayAgain}>
            再玩一次
          </ButtonSecondary>
        </div>
      )}
    </div>
  );
}