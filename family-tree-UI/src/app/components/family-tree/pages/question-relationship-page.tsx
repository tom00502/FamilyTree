import React, { useState } from 'react';
import { ButtonPrimary } from '../button-primary';
import { CardPerson } from '../card-person';
import { ProgressIndicator } from '../progress-indicator';

interface QuestionRelationshipPageProps {
  personName: string;
  timeRemaining: number;
  totalTime: number;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
}

export function QuestionRelationshipPage({ 
  personName, 
  timeRemaining,
  totalTime,
  onAnswer, 
  onSkip 
}: QuestionRelationshipPageProps) {
  const [selected, setSelected] = useState<string>('');
  
  const options = [
    '爸爸',
    '媽媽',
    '兄弟 / 姊妹',
    '叔叔 / 阿姨',
    '表兄弟姊妹',
    '不確定'
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6">
      <div className="w-full max-w-[390px] mx-auto space-y-6 pt-8">
        {/* Timer Progress */}
        <ProgressIndicator timeRemaining={timeRemaining} totalTime={totalTime} />
        
        {/* Question */}
        <h2 className="text-[#5C2E2E] text-center">
          {personName} 是你的誰？
        </h2>
        
        {/* Person Card */}
        <CardPerson name={personName} />
        
        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`w-full py-4 px-6 rounded-md border-2 transition-all text-left ${
                selected === option
                  ? 'bg-[#8B2635] text-[#FAF8F3] border-[#D4AF37]'
                  : 'bg-[#F5F1E8] text-[#5C2E2E] border-[#8B8278]/30 hover:border-[#8B2635]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onSkip}
            className="text-[#8B8278] hover:text-[#5C2E2E] text-center py-2"
          >
            跳過此題
          </button>
          
          <ButtonPrimary 
            fullWidth 
            onClick={() => selected && onAnswer(selected)}
            disabled={!selected}
          >
            確認
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
