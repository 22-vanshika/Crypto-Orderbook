"use client";

import { useExchangeStore } from "@/stores/exchangeStore";
import { cn } from "@/lib/utils";

interface PairSelectorProps {
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  dynamicPairs?: string[];
}

export default function PairSelector({
  className,
  labelClassName,
  selectClassName,
  showLabel = true,
  label = "Symbol",
  placeholder = "Select pair",
  dynamicPairs,
}: PairSelectorProps) {

  const { selectedPair, setSelectedPair } = useExchangeStore();

  const pairs = dynamicPairs || [];

  return (
    <div className={cn("text-white", className)}>
      {showLabel && (
        <label htmlFor="pair" className={cn("mr-2 font-medium", labelClassName)}>
          {label} : 
        </label>
      )}
      <select
        id="pair"
        value={selectedPair}
        onChange={(e) => setSelectedPair(e.target.value)}
        className={cn(
          "bg-black text-white border border-gray-500 rounded-md py-1",
          selectClassName
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {pairs.map((pair) => (
          <option key={pair} value={pair}>
            {pair}
          </option>
        ))}
      </select>
    </div>
  );
}