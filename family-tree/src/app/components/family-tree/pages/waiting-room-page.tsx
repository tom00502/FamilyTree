import { ButtonPrimary } from '../button-primary';
import { ButtonSecondary } from '../button-secondary';
import { CheckCircle2, Clock } from 'lucide-react';

interface Player {
  name: string;
  completed: boolean;
}

interface WaitingRoomPageProps {
  roomCode: string;
  players: Player[];
  onShareLink: () => void;
  onStart: () => void;
}

export function WaitingRoomPage({ roomCode, players, onShareLink, onStart }: WaitingRoomPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6 flex flex-col">
      <div className="w-full max-w-[390px] mx-auto flex-1 flex flex-col justify-center space-y-8">

        {/* Room Info */}
        <div className="bg-[#8B2635] text-[#FAF8F3] rounded-xl p-6 text-center shadow-lg border-2 border-[#D4AF37] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5" />
          <h3 className="text-[#D4AF37] text-sm font-bold mb-2 uppercase tracking-widest">你的專屬房間代碼</h3>
          <div className="text-4xl font-black tracking-widest drop-shadow-md">
            {roomCode || "載入中..."}
          </div>
          <p className="text-xs text-[#FAF8F3]/70 mt-3">請將此代碼告訴朋友，讓他們在首頁輸入加入</p>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#8B2635]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-[#8B2635] border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-[#5C2E2E] font-bold">等待玩家加入…</h2>
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