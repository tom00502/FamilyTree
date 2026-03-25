import { useState, useEffect, useMemo } from 'react';
import { ButtonPrimary } from '../button-primary';
import { ButtonSecondary } from '../button-secondary';
import { InputText } from '../input-text';
import { ProgressIndicator } from '../progress-indicator';
import { useGame } from '../../../context/GameContext';

interface OpenQuestionPageProps {
  question: string;
  questionObj?: any;
  subjectHint?: string | null;
  timeRemaining: number;
  totalTime: number;
  onNext: (answer: string) => void;
  onPrevious: () => void;
  showPrevious?: boolean;
}

export function OpenQuestionPage({
  question,
  questionObj,
  subjectHint,
  timeRemaining,
  totalTime,
  onNext,
  onPrevious,
  showPrevious = true
}: OpenQuestionPageProps) {
  const [answer, setAnswer] = useState<string>('');
  const { members, dataList, attrsMap } = useGame();

  // 1. 強制清空上一題殘留：當題目切換時，立刻重設回答字串
  const contentKey = questionObj?.id || question;
  useEffect(() => {
    setAnswer('');
  }, [contentKey]);

  // 2. 自動生出候選清單：掃描房內所有已經存過的家族成員名字
  const knownNames = useMemo(() => {
    const names = new Set<string>();
    members.forEach((m: any) => { if (m.name) names.add(m.name); });
    dataList.forEach((d: any) => {
      if (d.answerer === 'system_cfg') return; // exclude inferred ghost entries
      if (d.b && !/^\d+$/.test(d.b.trim()) && d.b.trim() !== '' && !d.b.startsWith('未知')) names.add(d.b);
    });
    Object.values(attrsMap).forEach((attr: any) => { if (attr.displayName && !attr.displayName.startsWith('未知') && !/^\d+$/.test(attr.displayName.trim())) names.add(attr.displayName); });
    return Array.from(names);
  }, [members, dataList, attrsMap]);

  // Handle immediate submission for select options
  const handleSelectOption = (option: string) => {
    // 立即清空原本可能亂寫的文字，並送出
    setAnswer('');
    onNext(option);
  };

  const renderInputArea = () => {
    const qType = questionObj?.type || 'fill';

    if (qType === 'select') {
      const options: string[] = questionObj?.option || [];
      return (
        <div className="pt-4 space-y-3">
          {options.map((opt, idx) => (
            <ButtonSecondary
              key={idx}
              fullWidth
              onClick={() => handleSelectOption(opt)}
            >
              {opt}
            </ButtonSecondary>
          ))}
          <p className="text-sm text-[#8B8278] mt-4 text-center">
            如果不知道可以跳過
          </p>
        </div>
      );
    }

    if (qType === 'number') {
      return (
        <div className="pt-4" key={`num-${contentKey}`}>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="請輸入數字"
            className="w-full text-center text-xl px-4 py-3 rounded-md border-2 border-[#D4AF37] focus:border-[#8B2635] focus:outline-none transition-colors"
          />
          <p className="text-sm text-[#8B8278] mt-2 text-center">
            如果不知道可以跳過
          </p>
        </div>
      );
    }

    if (qType === 'date') {
      return (
        <div className="pt-4" key={`date-${contentKey}`}>
          <input
            type="date"
            value={answer}
            onClick={(e) => {
              if ('showPicker' in HTMLInputElement.prototype) {
                try { (e.target as any).showPicker(); } catch(err){}
              }
            }}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full text-center text-xl px-4 py-3 rounded-md border-2 border-[#D4AF37] focus:border-[#8B2635] focus:outline-none transition-colors 
            cursor-pointer hover:bg-[#FDFBF7]"
          />
          <p className="text-sm text-[#8B8278] mt-2 text-center">
            如果不知道可以跳過
          </p>
        </div>
      );
    }

    // Default 'fill' or any unknown type
    return (
      <div className="pt-4" key={`fill-${contentKey}`}>
        <input
          list="known-names-list"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="請輸入 (點擊下拉選單可自動填寫親戚名字)"
          className="w-full text-center text-xl px-4 py-3 rounded-md border-2 border-[#E8E1D3] focus:border-[#D4AF37] focus:outline-none transition-colors bg-white shadow-sm"
        />
        <datalist id="known-names-list">
          {knownNames.map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <p className="text-sm text-[#8B8278] mt-2 text-center">
          如果不知道可以跳過
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6">
      <div className="w-full max-w-[390px] mx-auto space-y-6 pt-8">
        {/* Timer Progress */}
        <ProgressIndicator timeRemaining={timeRemaining} totalTime={totalTime} />

        {/* Question */}
        <h2 className="text-[#5C2E2E] text-center">
          {question}
        </h2>
        {subjectHint && (
          <p className="text-[#8B8278] text-center text-sm">{subjectHint}</p>
        )}

        {/* Input */}
        {renderInputArea()}

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
            下一題 / 跳過
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
