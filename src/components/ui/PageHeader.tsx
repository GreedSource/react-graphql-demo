import type * as React from 'react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
}) => {
  return (
    <header className="relative isolate overflow-hidden rounded-[24px] border border-border/80 bg-surface-card px-5 py-5 shadow-[0_14px_34px_rgba(24,44,65,0.055)] transition-colors sm:px-7 sm:py-6 lg:px-8 lg:py-7">
      <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-4xl">
          {eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-[1.9rem] font-bold leading-[1.08] tracking-[-0.04em] text-text sm:text-[2.45rem]">{title}</h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-6 text-text-secondary">{description}</p>
        </div>
        {actions ? (
          <div className="relative flex w-full flex-wrap items-center gap-2 border-t border-border/70 pt-4 sm:w-auto sm:gap-3 lg:max-w-[45%] lg:justify-end lg:border-t-0 lg:pt-0">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
};
