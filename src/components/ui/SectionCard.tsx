import type * as React from 'react';
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

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  icon,
  badge,
  action,
  variant = 'default',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    default: 'workspace-card',
    outlined: 'border-border/70 bg-transparent shadow-none',
    elevated: 'workspace-card shadow-[0_22px_48px_rgba(24,44,65,0.1)]',
  };

  return (
    <section
      className={`group rounded-[20px] border p-5 transition-all duration-300 sm:p-6 ${variantStyles[variant]} ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-text">{title}</h2>
              {badge !== undefined && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-[11px] font-semibold text-accent bg-accent-soft">
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
      <div className="-mx-5 mb-5 h-px border-t border-border/65 sm:-mx-6" />

      {/* Content */}
      <div>{children}</div>
    </section>
  );
};
