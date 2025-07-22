import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EnhancedDatePickerProps {
  selected: Date | string | undefined | null;
  onSelect: (date: string | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}

const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  selected,
  onSelect,
  placeholder = "Selecteer datum",
  disabled,
}) => {
  // Safely get current date values
  const getSafeDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  };

  // Parse the selected value safely
  const parseSelectedDate = (): Date | undefined => {
    if (!selected) return undefined;
    
    try {
      if (selected instanceof Date) {
        return isNaN(selected.getTime()) ? undefined : selected;
      }
      
      if (typeof selected === 'string') {
        if (!selected.trim()) return undefined;
        
        // Handle dd/MM/yyyy format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(selected)) {
          const [day, month, year] = selected.split('/').map(Number);
          const date = new Date(year, month - 1, day);
          return isNaN(date.getTime()) ? undefined : date;
        }
        
        // Handle ISO format and other date strings
        const date = new Date(selected);
        return isNaN(date.getTime()) ? undefined : date;
      }
      
      return undefined;
    } catch (error) {
      console.warn('Error parsing date:', error);
      return undefined;
    }
  };

  const safeSelected = parseSelectedDate();
  const safeDate = getSafeDate();
  
  const [currentYear, setCurrentYear] = useState(safeSelected?.getFullYear() ?? safeDate.year);
  const [currentMonth, setCurrentMonth] = useState(safeSelected?.getMonth() ?? safeDate.month);

  // Update when selected changes
  useEffect(() => {
    const newSelected = parseSelectedDate();
    if (newSelected) {
      setCurrentYear(newSelected.getFullYear());
      setCurrentMonth(newSelected.getMonth());
    }
  }, [selected]);

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  const displayDate = new Date(currentYear, currentMonth, 1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !safeSelected && "text-muted-foreground")}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {safeSelected ? format(safeSelected, "dd/MM/yyyy", { locale: nl }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={() => navigateYear("prev")} type="button">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} type="button">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(displayDate, "MMMM yyyy", { locale: nl })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} type="button">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateYear("next")} type="button">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={safeSelected}
          onSelect={(date) => {
            if (date) {
              onSelect(format(date, "dd/MM/yyyy"));
            } else {
              onSelect(undefined);
            }
          }}
          month={displayDate}
          onMonthChange={(date) => {
            setCurrentYear(date.getFullYear());
            setCurrentMonth(date.getMonth());
          }}
          disabled={disabled}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedDatePicker;
