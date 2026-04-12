import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  action?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  icon,
  badge,
  action,
  variant = 'default',
  className = '',
}: SectionCardProps) {
  const variantStyles: Record<string, string> = {
    default: 'border-border bg-surface-card/90 shadow-sm',
    outlined: 'border-border/60 bg-transparent shadow-none',
    elevated: 'border-transparent bg-surface-card shadow-lg',
  };

  return (
    <section
      className={`group rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${variantStyles[variant]} ${className}`}
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-105">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text">{title}</h2>
              {badge !== undefined && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-[11px] font-semibold text-accent bg-accent/15">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Divider */}
      <div className="-mx-6 mb-5 h-px border-t border-border/50" />

      {/* Content */}
      <div>{children}</div>
    </section>
  );
}
