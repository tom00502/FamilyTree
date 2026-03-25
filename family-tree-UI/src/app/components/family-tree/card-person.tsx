import React from 'react';
import { User } from 'lucide-react';

interface CardPersonProps {
  name: string;
  birthYear?: string;
  relation?: string;
  imageSrc?: string;
  score?: number;
  rank?: number;
  badge?: string;
}

export function CardPerson({ 
  name, 
  birthYear, 
  relation, 
  imageSrc, 
  score,
  rank,
  badge 
}: CardPersonProps) {
  return (
    <div className="bg-[#F5F1E8] border border-[#C9A961] rounded-md p-4 shadow-md relative">
      {rank && (
        <div className="absolute -top-3 -right-3 bg-[#D4AF37] text-[#5C2E2E] rounded-full w-10 h-10 flex items-center justify-center border-2 border-[#8B2635]">
          {rank}
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#8B2635]/10 border-2 border-[#C9A961] flex items-center justify-center overflow-hidden flex-shrink-0">
          {imageSrc ? (
            <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-[#8B2635]" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-[#5C2E2E] truncate">{name}</h3>
          {relation && (
            <p className="text-sm text-[#8B8278]">{relation}</p>
          )}
          {birthYear && (
            <p className="text-sm text-[#8B8278]">{birthYear}</p>
          )}
          {badge && (
            <p className="text-sm text-[#D4AF37] mt-1">{badge}</p>
          )}
          {score !== undefined && (
            <p className="text-lg text-[#8B2635] mt-1">{score} 分</p>
          )}
        </div>
      </div>
    </div>
  );
}
