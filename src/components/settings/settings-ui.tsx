"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function SettingsPageShell({
  title,
  children,
  onBack,
}: {
  title: string;
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#f4f4f5]">
      <header className="relative flex items-center px-4 pt-5 pb-2">
        {onBack ? (
          <button
            type="button"
            aria-label="뒤로"
            onClick={onBack}
            className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
          >
            <ChevronLeft className="size-5 text-neutral-800" strokeWidth={2.2} />
          </button>
        ) : null}
        <h1 className="w-full text-center text-[17px] font-semibold text-neutral-900">{title}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-2">{children}</div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="px-1 pb-2 pt-5 text-[13px] text-neutral-400">{children}</p>;
}

export function SettingsCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[22px] bg-[#ececee] px-4 py-1", className)}>{children}</div>
  );
}

export function RowDivider() {
  return <div className="h-px bg-black/6" />;
}

export function SettingsRow({
  title,
  description,
  trailing,
  onClick,
}: {
  title: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1 py-3.5 pr-3">
        <p className="text-[16px] font-semibold text-neutral-900">{title}</p>
        {description ? <p className="pt-0.5 text-[12px] leading-snug text-neutral-400">{description}</p> : null}
      </div>
      {trailing}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex w-full items-center text-left">
        {inner}
      </button>
    );
  }
  return <div className="flex items-center">{inner}</div>;
}

export function Chevron() {
  return <ChevronRight className="size-5 shrink-0 text-neutral-300" strokeWidth={2} />;
}

export function IosSwitch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors",
        checked ? "bg-neutral-900" : "bg-neutral-300",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] size-[27px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

export function CapsuleButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center rounded-full border border-neutral-200 bg-white text-[15px] font-medium text-neutral-900 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-full bg-white/80 p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 min-w-[64px] flex-1 rounded-full px-3 text-[13px] font-medium",
              active ? "bg-neutral-900 text-white" : "text-neutral-500",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
