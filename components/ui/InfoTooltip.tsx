"use client";
import { Info } from "lucide-react"; 
import { useState } from "react";
import { cn } from "@/lib/utils"; 

interface InfoTooltipProps {
  description: string; 
  className?: string; 
}

export function InfoTooltip({ description, className }: InfoTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-200 cursor-help" />
      {isHovered && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg text-xs text-neutral-200 z-50">
          {description}
        </div>
      )}
    </div>
  );
}
