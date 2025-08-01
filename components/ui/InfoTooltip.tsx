"use client";
import { Info } from "lucide-react"; 
import { useState } from "react";
import { cn } from "@/lib/utils"; 

interface InfoTooltipProps {
  description: string; 
  className?: string; 
}

export function InfoTooltip({ description, className }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onClick={handleClick}
      tabIndex={0} // Makes it focusable for keyboard navigation
      onBlur={() => setIsVisible(false)} // Hides when focus leaves (e.g., click elsewhere)
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsVisible((prev) => !prev);
        }
      }}
    >
      <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-200 cursor-help" aria-label="Toggle information" role="button" />
      {isVisible && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg text-xs text-neutral-200 z-50">
          {description}
        </div>
      )}
    </div>
  );
}
