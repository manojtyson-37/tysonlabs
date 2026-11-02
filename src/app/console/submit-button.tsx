'use client';

import { useFormStatus } from 'react-dom';

/** Disabled while the form is submitting, so a double click cannot send the approval twice. */
export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={`${className ?? ''} disabled:opacity-50`}>
      {pending ? 'Working…' : children}
    </button>
  );
}
