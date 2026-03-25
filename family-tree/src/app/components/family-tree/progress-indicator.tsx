import React from 'react';

interface ProgressIndicatorProps {
  currentStep?: number;
  totalSteps?: number;
  timeRemaining?: number;
  totalTime?: number;
  label?: string;
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  timeRemaining,
  totalTime,
  label 
}: ProgressIndicatorProps) {
  // Step-based progress
  if (currentStep !== undefined && totalSteps !== undefined) {
    const progress = (currentStep / totalSteps) * 100;
    
    return (
      null
    );
  }
  
  // Time-based countdown
  if (timeRemaining !== undefined && totalTime !== undefined) {
    const progress = (timeRemaining / totalTime) * 100;
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#8B8278]">剩餘時間</span>
          <span className="text-sm text-[#8B2635]">{timeRemaining}秒</span>
        </div>
        <div className="w-full h-2 bg-[#F5F1E8] border border-[#C9A961] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#8B2635] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }
  
  return null;
}
