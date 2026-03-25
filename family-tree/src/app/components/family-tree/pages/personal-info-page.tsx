import { useState } from 'react';
import { ButtonPrimary } from '../button-primary';
import { InputText } from '../input-text';
import { ProgressIndicator } from '../progress-indicator';

interface PersonalInfoPageProps {
  onNext: (data: { name: string; birthDate: string; gender: string }) => void;
  totalSteps?: number;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function PersonalInfoPage({ onNext, totalSteps = 3, isLoading = false, errorMessage }: PersonalInfoPageProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'男' | '女' | ''>('');

  const handleSubmit = () => {
    if (name && birthDate && gender) {
      onNext({ name, birthDate, gender });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-6">
      <div className="w-full max-w-[390px] mx-auto space-y-6 pt-8">
        {/* Progress */}
        <ProgressIndicator currentStep={1} totalSteps={totalSteps} />

        {/* 標題 */}
        <h2 className="text-[#5C2E2E] text-center">關於你自己</h2>

        {/* Form */}
        <div className="space-y-4">
          <InputText
            label="姓名"
            value={name}
            onChange={setName}
            placeholder="請輸入你的姓名"
          />

          <InputText
            label="出生年月日"
            value={birthDate}
            onChange={setBirthDate}
            placeholder="YYYY / MM / DD"
            type="date"
          />

          {/* Gender Selection */}
          <div className="space-y-2">
            <label className="text-[#5C2E2E]">性別</label>
            <div className="grid grid-cols-2 gap-3">
              {['男', '女'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g as '男' | '女')}
                  className={`py-3 rounded-md border-2 transition-all ${gender === g
                    ? 'bg-[#8B2635] text-[#FAF8F3] border-[#D4AF37]'
                    : 'bg-[#F5F1E8] text-[#8B2635] border-[#8B8278]/30 hover:border-[#8B2635]'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Next Button */}
        <ButtonPrimary
          fullWidth
          onClick={handleSubmit}
          disabled={!name || !birthDate || !gender || isLoading}
        >
          {isLoading ? '連線中...' : '下一步'}
        </ButtonPrimary>
      </div>
    </div>
  );
}
