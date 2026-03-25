import React, { useState } from 'react';
import { ButtonPrimary } from '../button-primary';
import { ButtonSecondary } from '../button-secondary';
import { InputText } from '../input-text';
import { ProgressIndicator } from '../progress-indicator';

interface OpenQuestionPageProps {
  question: string;
  timeRemaining: number;
  totalTime: number;
  onNext: (answer: string) => void;
  onPrevious: () => void;
  showPrevious?: boolean;
}

export function OpenQuestionPage({ 
  question, 
  timeRemaining,
  totalTime,
  onNext, 
  onPrevious,
  showPrevious = true
}: OpenQuestionPageProps) {
  const [answer, setAnswer] = useState<string>('');

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6">
      <div className="w-full max-w-[390px] mx-auto space-y-6 pt-8">
        {/* Timer Progress */}
        <ProgressIndicator timeRemaining={timeRemaining} totalTime={totalTime} />
        
        {/* Question */}
        <h2 className="text-[#5C2E2E] text-center">
          {question}
        </h2>
        
        {/* Input */}
        <div className="pt-4">
          <InputText
            value={answer}
            onChange={setAnswer}
            placeholder="請輸入姓名"
          />
          <p className="text-sm text-[#8B8278] mt-2 text-center">
            如果不知道可以跳過
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-8">
          {showPrevious && (
            <ButtonSecondary onClick={onPrevious}>
              上一題
            </ButtonSecondary>
          )}
          <ButtonPrimary 
            onClick={() => onNext(answer)}
            fullWidth={!showPrevious}
          >
            下一題
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
