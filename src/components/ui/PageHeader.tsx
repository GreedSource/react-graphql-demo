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
    <header className="relative flex flex-col gap-4 overflow-hidden border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="pointer-events-none absolute -right-10 -top-20 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-[2rem]">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
};
