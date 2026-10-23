"use client";

import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  htmlFor?: string;
}

export function Field({ label, children, error, hint, htmlFor }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-text-primary/60">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium text-text-primary/80">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={`input-ve ${error ? "border-text-primary/30" : ""} ${className}`}
      {...props}
    />
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`input-ve min-h-[100px] resize-none ${error ? "border-text-primary/30" : ""} ${className}`}
      {...props}
    />
  );
}
