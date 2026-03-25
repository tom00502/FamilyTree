import React from 'react';

interface ButtonPrimaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  variant?: 'filled' | 'outline';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function ButtonPrimary({ 
  children, 
  onClick, 
  fullWidth = false, 
  variant = 'filled',
  disabled = false,
  type = 'button'
}: ButtonPrimaryProps) {
  const baseClasses = "px-6 py-3 rounded-md transition-all duration-200 active:scale-95";
  const widthClass = fullWidth ? "w-full" : "";
  
  const variantClasses = variant === 'filled' 
    ? "bg-[#8B2635] text-[#FAF8F3] border border-[#D4AF37] hover:bg-[#6B1D28] shadow-sm"
    : "bg-[#FAF8F3] text-[#8B2635] border-2 border-[#8B2635] hover:bg-[#F5F1E8]";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${widthClass} ${variantClasses} ${disabledClasses}`}
    >
      {children}
    </button>
  );
}
