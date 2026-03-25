import React from 'react';

interface InputTextProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'date';
}

export function InputText({ 
  label, 
  placeholder, 
  value, 
  onChange,
  type = 'text' 
}: InputTextProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#5C2E2E]">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 bg-white/60 border-b-2 border-[#8B8278]/30 rounded-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-[#5C2E2E] placeholder:text-[#8B8278]/50"
      />
    </div>
  );
}
