import type * as React from 'react';

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  centerLabel: string;
  centerValue: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, centerLabel, centerValue }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient = data.map((item) => {
    const start = total ? (cursor / total) * 100 : 0;
    cursor += item.value;
    const end = total ? (cursor / total) * 100 : 0;
    return `${item.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div
        className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full"
        style={{ background: total ? `conic-gradient(${gradient})` : 'var(--bg-secondary)' }}
        role="img"
        aria-label={`${centerValue} ${centerLabel}`}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-surface-card text-center shadow-inner">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-text">{centerValue}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-3">
        {data.map((item) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={item.label}>
            <span className="flex min-w-0 items-center gap-2 text-text-secondary">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="font-semibold tabular-nums text-text">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
