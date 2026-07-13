"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          "z-50 w-72 rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-slate-100 shadow-2xl backdrop-blur-xl",
          className,
        )}
        sideOffset={8}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
