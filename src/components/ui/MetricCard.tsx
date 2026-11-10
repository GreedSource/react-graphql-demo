import type * as React from 'react';
import type { ReactNode } from 'react';

export type MetricTone = 'accent' | 'blue' | 'green' | 'amber' | 'rose';

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: ReactNode;
  tone?: MetricTone;
}

const toneStyles: Record<MetricTone, { icon: string; glow: string }> = {
  accent: { icon: 'bg-accent-soft text-accent', glow: 'from-accent/14' },
  blue: { icon: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200', glow: 'from-sky-300/25' },
  green: { icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200', glow: 'from-emerald-300/25' },
  amber: { icon: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200', glow: 'from-amber-300/25' },
  rose: { icon: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200', glow: 'from-rose-300/25' },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  detail,
  icon,
  tone = 'accent',
}) => {
  const styles = toneStyles[tone];

  return (
    <article className="workspace-card relative overflow-hidden p-5">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${styles.glow} to-transparent opacity-80`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-text">{value}</p>
          {detail ? <p className="mt-1 text-xs text-text-secondary">{detail}</p> : null}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${styles.icon}`} aria-hidden="true">
          {icon}
        </span>
      </div>
    </article>
  );
};
