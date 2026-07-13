"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          "z-50 rounded-xl border border-white/10 bg-slate-950/95 px-3 py-1.5 text-xs text-slate-100 shadow-2xl",
          className,
        )}
        sideOffset={6}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
