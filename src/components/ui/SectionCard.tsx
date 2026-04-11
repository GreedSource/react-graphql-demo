import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-border bg-surface-card/90 p-6 shadow-sm transition-colors duration-300">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {description ? (
          <p className="text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
