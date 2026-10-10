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
    <header className="relative flex flex-col gap-5 overflow-hidden border-b border-border/70 pb-7 lg:flex-row lg:items-end lg:justify-between">
      <div className="pointer-events-none absolute -right-10 -top-24 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative space-y-2">
        {eyebrow ? (
          <p className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[1.85rem] font-bold tracking-[-0.035em] text-text sm:text-[2.2rem]">{title}</h1>
        <p className="max-w-3xl text-[15px] leading-6 text-text-secondary">{description}</p>
      </div>
      {actions ? <div className="relative flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
    </header>
  );
};
