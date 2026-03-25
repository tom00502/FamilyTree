import React from 'react';
import { ButtonPrimary } from '../button-primary';
import { ButtonSecondary } from '../button-secondary';
import { CardPerson } from '../card-person';
import { Trophy, Medal } from 'lucide-react';

interface Player {
  name: string;
  score: number;
  badge?: string;
}

interface ScoreboardPageProps {
  topPlayers: Player[];
  onViewFamilyTree: () => void;
  onPlayAgain: () => void;
}

export function ScoreboardPage({ topPlayers, onViewFamilyTree, onPlayAgain }: ScoreboardPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6">
      <div className="w-full max-w-[390px] mx-auto space-y-6 pt-8">
        {/* Header with Decoration */}
        <div className="bg-gradient-to-r from-[#8B2635] to-[#6B1D28] rounded-lg p-6 text-center border-2 border-[#D4AF37] shadow-lg relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          <Trophy className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
          <h1 className="text-[#FAF8F3] mb-1">家族智慧紅榜</h1>
          <p className="text-sm text-[#FAF8F3]/80">恭喜以下成員！</p>
        </div>
        
        {/* Top 3 Rankings */}
        <div className="space-y-4">
          {topPlayers.map((player, index) => (
            <div key={index} className={index === 0 ? 'transform scale-105' : ''}>
              <CardPerson
                name={player.name}
                score={player.score}
                rank={index + 1}
                badge={player.badge}
              />
            </div>
          ))}
        </div>
        
        {/* Scoring Info */}
        <div className="bg-[#F5F1E8] border border-[#C9A961] rounded-md p-4">
          <h3 className="text-[#5C2E2E] mb-3 flex items-center gap-2">
            <Medal className="w-5 h-5 text-[#D4AF37]" />
            得分說明
          </h3>
          <ul className="text-sm text-[#8B8278] space-y-1">
            <li>• 每題答對 +10 分</li>
            <li>• 跳過 0 分</li>
            <li>• 速度加分</li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <ButtonPrimary fullWidth onClick={onViewFamilyTree}>
            查看完整家庭樹
          </ButtonPrimary>
          
          <ButtonSecondary fullWidth onClick={onPlayAgain}>
            再玩一次
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
