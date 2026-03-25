import React, { useState } from 'react';
import { ButtonPrimary } from '../button-primary';

interface LandingPageProps {
  onStart: (duration: number) => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(120);

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-6">
      {/* 裝飾性雲紋背景 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#8B2635]/5 to-transparent" />
      
      <div className="w-full max-w-[390px] flex flex-col items-center gap-8 relative z-10">
        {/* Logo Placeholder */}
        <div className="w-24 h-24 bg-[#8B2635] rounded-full flex items-center justify-center border-4 border-[#D4AF37] shadow-lg">
          <div className="text-4xl text-[#FAF8F3]">族</div>
        </div>
        
        {/* 主標題 */}
        <div className="text-center space-y-3">
          <h1 className="text-[#5C2E2E]">一起拼出我們的家族樹</h1>
          <p className="text-[#8B8278]">適合家庭聚會・全員一起玩的互動遊戲</p>
        </div>
        
        {/* Segmented Control */}
        <div className="w-full space-y-3">
          <label className="block text-[#5C2E2E] text-center">請選擇遊戲秒數</label>
          <div className="grid grid-cols-3 gap-3">
            {[90, 120, 180].map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`py-3 rounded-md border-2 transition-all ${
                  selectedDuration === duration
                    ? 'bg-[#8B2635] text-[#FAF8F3] border-[#D4AF37]'
                    : 'bg-[#F5F1E8] text-[#8B2635] border-[#8B8278]/30 hover:border-[#8B2635]'
                }`}
              >
                {duration} 秒
              </button>
            ))}
          </div>
        </div>
        
        {/* Start Button */}
        <ButtonPrimary 
          fullWidth 
          variant="outline"
          onClick={() => onStart(selectedDuration)}
        >
          創建你的家庭族譜
        </ButtonPrimary>
      </div>
      
      {/* 裝飾性底部 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#8B2635]/5 to-transparent" />
    </div>
  );
}
