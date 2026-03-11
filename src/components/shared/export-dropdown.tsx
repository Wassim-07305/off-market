"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Table, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportOption {
  label: string;
  icon: typeof FileText;
  onClick: () => void;
}

interface ExportDropdownProps {
  options: ExportOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function ExportDropdown({
  options,
  label = "Exporter",
  disabled,
  className,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (options.length === 1) {
    const opt = options[0];
    const Icon = opt.icon;
    return (
      <button
        onClick={opt.onClick}
        disabled={disabled}
        className={cn(
          "h-9 px-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2 disabled:opacity-50",
          className
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {opt.label}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          "h-9 px-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2 disabled:opacity-50",
          className
        )}
      >
        <Download className="w-3.5 h-3.5" />
        {label}
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  opt.onClick();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
