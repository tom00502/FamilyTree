import React from 'react';
import { ButtonPrimary } from '../button-primary';
import { ButtonSecondary } from '../button-secondary';
import { CheckCircle2, Clock } from 'lucide-react';

interface Player {
  name: string;
  completed: boolean;
}

interface WaitingRoomPageProps {
  players: Player[];
  onShareLink: () => void;
  onStart: () => void;
}

export function WaitingRoomPage({ players, onShareLink, onStart }: WaitingRoomPageProps) {
  const allCompleted = players.every(p => p.completed);
  
  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6 flex flex-col">
      <div className="w-full max-w-[390px] mx-auto flex-1 flex flex-col justify-center space-y-8">
        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-[#8B2635]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-[#8B2635] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full" />
            </div>
          </div>
          
          <h2 className="text-[#5C2E2E]">等待玩家加入…</h2>
        </div>
        
        {/* Player List */}
        <div className="bg-[#F5F1E8] border border-[#C9A961] rounded-md p-4 space-y-3">
          {players.map((player, index) => (
            <div key={index} className="flex items-center gap-3">
              {player.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#8B2635]" />
              ) : (
                <Clock className="w-5 h-5 text-[#8B8278] animate-pulse" />
              )}
              <span className={player.completed ? 'text-[#5C2E2E]' : 'text-[#8B8278]'}>
                {player.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <ButtonSecondary fullWidth onClick={onShareLink}>
            複製邀請連結
          </ButtonSecondary>
          
          <ButtonPrimary 
            fullWidth 
            onClick={onStart}
          >
            準備好了，開始！
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}