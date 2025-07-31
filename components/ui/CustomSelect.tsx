// CustomSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { SelectOption } from '../../types/domain'; // Assuming types.ts is in the same folder

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option", 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  // Close the dropdown if you click outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOptionLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative w-[60%]" ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="form-input flex w-full items-center justify-between text-left bg-neutral-800 border-neutral-700 text-white disabled:bg-neutral-800/50 disabled:cursor-not-allowed"
      >
        <span>{selectedOptionLabel}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="cursor-pointer px-4 py-2 text-white hover:bg-blue-600"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
