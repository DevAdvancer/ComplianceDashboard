"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface MonthYearPickerProps {
  value?: string; // format: "YYYY-MM" e.g., "2024-03"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MonthYearPicker({
  value = "",
  onChange,
  placeholder = "Select month & year",
  className,
  disabled = false,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial or current value
  const parsedValue = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length >= 2) {
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10) - 1;
      if (!isNaN(yr) && mo >= 0 && mo < 12) {
        return { year: yr, month: mo };
      }
    }
    return null;
  }, [value]);

  const [viewYear, setViewYear] = React.useState<number>(() =>
    parsedValue ? parsedValue.year : new Date().getFullYear(),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && parsedValue) {
      setViewYear(parsedValue.year);
    }
    setOpen(nextOpen);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, "0");
    onChange(`${viewYear}-${formattedMonth}`);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    onChange(`${yr}-${mo}`);
    setOpen(false);
  };

  const displayText = parsedValue
    ? `${FULL_MONTHS[parsedValue.month]}, ${parsedValue.year}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-slate-100 transition-all hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50",
            !parsedValue && "text-slate-500",
            className,
          )}>
          <span>{displayText}</span>
          <CalendarIcon className="size-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 text-slate-100 shadow-2xl border-white/15 bg-slate-900/95 backdrop-blur-xl">
        {/* Year Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="text-base font-semibold tracking-wide text-white">
            {viewYear}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* 3x4 Month Grid */}
        <div className="grid grid-cols-4 gap-2 py-4">
          {SHORT_MONTHS.map((monthName, idx) => {
            const isSelected =
              parsedValue?.year === viewYear && parsedValue?.month === idx;

            return (
              <button
                key={monthName}
                type="button"
                onClick={() => handleSelectMonth(idx)}
                className={cn(
                  "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-all",
                  isSelected
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-400"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}>
                {monthName}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-medium">
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-white transition-colors px-1 py-0.5">
            Clear
          </button>
          <button
            type="button"
            onClick={handleThisMonth}
            className="text-sky-400 hover:text-sky-300 transition-colors px-1 py-0.5">
            This month
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
