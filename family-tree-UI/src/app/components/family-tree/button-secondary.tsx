import React from 'react';

interface ButtonSecondaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function ButtonSecondary({ 
  children, 
  onClick, 
  fullWidth = false,
  disabled = false,
  type = 'button'
}: ButtonSecondaryProps) {
  const baseClasses = "px-6 py-3 rounded-md transition-all duration-200 active:scale-95";
  const widthClass = fullWidth ? "w-full" : "";
  const variantClasses = "bg-[#F5F1E8] text-[#8B2635] border-2 border-[#8B2635] hover:bg-[#EAE6DC]";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    null
  );
}
