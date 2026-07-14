"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GetStartedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function GetStartedButton({ label = "Get Started", className, ...props }: GetStartedButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-blue-deep px-7 py-3.5 font-semibold text-bg transition-transform",
        "hover:scale-[1.03] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{label}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      <span className="absolute inset-0 -translate-x-full bg-bg/15 transition-transform duration-500 group-hover:translate-x-0" />
    </button>
  );
}
