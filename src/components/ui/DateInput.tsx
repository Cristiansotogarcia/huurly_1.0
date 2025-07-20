import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value = '', onChange, placeholder = 'dd/mm/yyyy', className, id, required, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastValidValue = useRef(value);

    useEffect(() => {
      setDisplayValue(value);
      lastValidValue.current = value;
    }, [value]);

    const formatDateInput = (input: string): string => {
      // Remove all non-numeric characters
      const numbers = input.replace(/\D/g, '');
      
      // Apply formatting based on length
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
      }
    };

    const isValidDate = (dateStr: string): boolean => {
      if (!dateStr || dateStr.length !== 10) return false;
      
      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regex.test(dateStr)) return false;
      
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Check if the date is valid
      return date.getDate() === day && 
             date.getMonth() === month - 1 && 
             date.getFullYear() === year &&
             year >= 1900 && 
             date <= new Date();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cursorPosition = e.target.selectionStart || 0;
      
      // If user is deleting, allow it
      if (inputValue.length < displayValue.length) {
        setDisplayValue(inputValue);
        onChange?.(inputValue);
        return;
      }
      
      const formatted = formatDateInput(inputValue);
      setDisplayValue(formatted);
      
      // Auto-advance cursor after day or month
      setTimeout(() => {
        if (inputRef.current) {
          const numbers = inputValue.replace(/\D/g, '');
          
          if (numbers.length === 2 && !inputValue.includes('/')) {
            // Just typed day, move to month
            inputRef.current.setSelectionRange(3, 3);
          } else if (numbers.length === 4 && inputValue.split('/').length === 2) {
            // Just typed month, move to year
            inputRef.current.setSelectionRange(6, 6);
          }
        }
      }, 0);
      
      onChange?.(formatted);
    };

    const handleBlur = () => {
      // Validate on blur and revert to last valid value if invalid
      if (displayValue && !isValidDate(displayValue)) {
        setDisplayValue(lastValidValue.current);
        onChange?.(lastValidValue.current);
      } else if (isValidDate(displayValue)) {
        lastValidValue.current = displayValue;
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow navigation keys, backspace, delete
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ];
      
      if (allowedKeys.includes(e.key)) {
        return;
      }
      
      // Only allow numbers
      if (!/\d/.test(e.key)) {
        e.preventDefault();
        return;
      }
      
      // Prevent typing if already at max length
      const numbers = displayValue.replace(/\D/g, '');
      if (numbers.length >= 8) {
        e.preventDefault();
      }
    };

    return (
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          id={id}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn('pl-10', className)}
          maxLength={10}
          required={required}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';