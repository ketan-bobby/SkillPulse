import { useState } from "react";

interface TestCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function TestCheckbox({ checked = false, onCheckedChange, disabled = false }: TestCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(checked);
  
  const handleClick = () => {
    if (disabled) return;
    const newChecked = !internalChecked;
    setInternalChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={internalChecked}
      disabled={disabled}
      onClick={handleClick}
      className={`
        w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all
        ${internalChecked 
          ? 'bg-blue-600 border-blue-600 text-white' 
          : 'bg-white border-gray-300 hover:border-blue-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        minWidth: '20px',
        minHeight: '20px',
        padding: '0',
        margin: '0'
      }}
    >
      {internalChecked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}