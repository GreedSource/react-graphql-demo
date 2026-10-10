import * as React from 'react';

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

interface DonutSegment {
  item: DonutDatum;
  startAngle: number;
  endAngle: number;
  middleAngle: number;
}

const CENTER = 80;
const RADIUS = 64;
const SVG_SIZE = 160;
const STROKE_WIDTH = 24;

const pointOnCircle = (angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(radians),
    y: CENTER + RADIUS * Math.sin(radians),
  };
};

const describeSegment = (startAngle: number, endAngle: number) => {
  const start = pointOnCircle(startAngle);
  const end = pointOnCircle(endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

export const DonutChart: React.FC<DonutChartProps> = ({ data, centerLabel, centerValue }) => {
  const [hiddenLabels, setHiddenLabels] = React.useState<Set<string>>(() => new Set());
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const visibleData = data.filter((item) => !hiddenLabels.has(item.label));
  const visibleTotal = visibleData.reduce((sum, item) => sum + item.value, 0);
  const segments: DonutSegment[] = [];
  let cursor = -90;

  visibleData.forEach((item) => {
    if (item.value <= 0 || visibleTotal <= 0) return;
    const startAngle = cursor;
    const endAngle = cursor + (item.value / visibleTotal) * 360;
    segments.push({
      item,
      startAngle,
      endAngle: Math.min(endAngle, startAngle + 359.99),
      middleAngle: startAngle + (endAngle - startAngle) / 2,
    });
    cursor = endAngle;
  });

  const toggleLabel = (label: string) => {
    setHiddenLabels((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const displayValue = data.length ? visibleTotal : centerValue;
  const chartId = React.useId().replaceAll(':', '');

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative grid h-36 w-36 shrink-0 place-items-center">
        <svg
          className="h-36 w-36 overflow-visible"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          role="img"
          aria-label={`${displayValue} ${centerLabel}`}
          id={chartId}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--bg-secondary)" strokeWidth={STROKE_WIDTH} />
          {segments.map(({ item, startAngle, endAngle, middleAngle }) => {
            const isActive = activeLabel === item.label;
            const radians = (middleAngle * Math.PI) / 180;
            const offset = isActive ? 4 : 0;
            return (
              <path
                className="cursor-pointer"
                d={describeSegment(startAngle + 1, endAngle - 1)}
                fill="none"
                key={item.label}
                pathLength="100"
                stroke={item.color}
                strokeLinecap="round"
                strokeWidth={isActive ? STROKE_WIDTH + 8 : STROKE_WIDTH}
                style={{
                  transform: `translate(${Math.cos(radians) * offset}px, ${Math.sin(radians) * offset}px)`,
                  transition: 'stroke-width 180ms ease, transform 180ms ease',
                }}
                onMouseEnter={() => setActiveLabel(item.label)}
                onMouseLeave={() => setActiveLabel(null)}
                onFocus={() => setActiveLabel(item.label)}
                onBlur={() => setActiveLabel(null)}
                tabIndex={0}
                role="img"
                aria-label={`${item.label}: ${item.value}`}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center" aria-live="polite">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-text">{displayValue}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-2" id={`${chartId}-legend`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">Selecciona un estado para incluirlo o quitarlo.</p>
          {hiddenLabels.size ? (
            <button className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent-soft" type="button" onClick={() => setHiddenLabels(new Set())}>
              Restablecer
            </button>
          ) : null}
        </div>
        {data.map((item) => {
          const isVisible = !hiddenLabels.has(item.label);
          return (
            <button
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-elevated ${isVisible ? '' : 'opacity-55'}`}
              type="button"
              key={item.label}
              aria-controls={chartId}
              aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} ${item.label}`}
              aria-pressed={isVisible}
              onClick={() => toggleLabel(item.label)}
              onMouseEnter={() => setActiveLabel(item.label)}
              onMouseLeave={() => setActiveLabel(null)}
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-text-secondary">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className={isVisible ? 'truncate' : 'truncate line-through'}>{item.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-text">{item.value}</span>
            </button>
          );
        })}
        {!total ? <p className="pt-2 text-xs text-text-muted">Aún no hay datos para distribuir.</p> : null}
      </div>
    </div>
  );
};
