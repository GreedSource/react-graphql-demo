import * as React from 'react';

export interface AnalyticsBarDatum {
  label: string;
  value: number;
  color?: string;
  caption?: string;
}

interface AnalyticsBarChartProps {
  data: AnalyticsBarDatum[];
  emptyLabel?: string;
  valueFormatter?: (value: number) => string;
}

export const AnalyticsBarChart: React.FC<AnalyticsBarChartProps> = ({
  data,
  emptyLabel = 'Aún no hay datos suficientes para mostrar esta gráfica.',
  valueFormatter = (value) => String(value),
}) => {
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null);
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  if (!data.length) {
    return <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-4" role="list" aria-label="Gráfica de barras">
      {data.map((item) => (
        <div
          className={`group grid cursor-default grid-cols-[minmax(88px,0.5fr)_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-elevated focus-visible:bg-surface-elevated ${activeLabel === item.label ? 'bg-surface-elevated' : ''}`}
          key={item.label}
          role="listitem"
          aria-label={`${item.label}: ${valueFormatter(item.value)}${item.caption ? `, ${item.caption}` : ''}`}
          tabIndex={0}
          onMouseEnter={() => setActiveLabel(item.label)}
          onMouseLeave={() => setActiveLabel(null)}
          onFocus={() => setActiveLabel(item.label)}
          onBlur={() => setActiveLabel(null)}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{item.label}</p>
            {item.caption ? <p className="truncate text-xs text-text-muted">{item.caption}</p> : null}
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-elevated" role="presentation">
            <div
              className={`h-full min-w-1 rounded-full bg-accent transition-all duration-500 group-hover:scale-y-125 ${activeLabel === item.label ? 'scale-y-125' : ''}`}
              style={{ width: `${Math.max((item.value / maxValue) * 100, item.value ? 4 : 0)}%`, backgroundColor: item.color }}
            />
          </div>
          <span className="min-w-12 text-right text-sm font-semibold tabular-nums text-text">{valueFormatter(item.value)}</span>
        </div>
      ))}
    </div>
  );
};
