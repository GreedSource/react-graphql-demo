import * as React from 'react';
import type { TaskActivityTrendDatum } from '@/lib/project-analytics';

type TrendSeriesKey = 'created' | 'completed' | 'due';

interface TrendSeries {
  key: TrendSeriesKey;
  label: string;
  color: string;
}

interface AnalyticsTrendChartProps {
  data: TaskActivityTrendDatum[];
  emptyLabel?: string;
}

const series: TrendSeries[] = [
  { key: 'created', label: 'Creadas', color: '#38bdf8' },
  { key: 'completed', label: 'Completadas', color: '#34d399' },
  { key: 'due', label: 'Vencen', color: '#f59e0b' },
];

const CHART_WIDTH = 720;
const CHART_HEIGHT = 180;
const PLOT_LEFT = 40;
const PLOT_RIGHT = 16;
const PLOT_TOP = 14;
const PLOT_BOTTOM = 30;
const PLOT_WIDTH = CHART_WIDTH - PLOT_LEFT - PLOT_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;

const getX = (index: number, total: number) => {
  const divisor = Math.max(total - 1, 1);
  return PLOT_LEFT + (index / divisor) * PLOT_WIDTH;
};

const getY = (value: number, maxValue: number) => PLOT_TOP + PLOT_HEIGHT - (value / maxValue) * PLOT_HEIGHT;

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  data,
  emptyLabel = 'Aún no hay fechas suficientes para mostrar una tendencia.',
}) => {
  const [hiddenSeries, setHiddenSeries] = React.useState<Set<TrendSeriesKey>>(() => new Set());
  const [activePoint, setActivePoint] = React.useState<number | null>(null);
  const visibleSeries = series.filter(({ key }) => !hiddenSeries.has(key));
  const hasActivity = data.some((point) => series.some(({ key }) => point[key] > 0));
  const maxValue = Math.max(...data.flatMap((point) => visibleSeries.map(({ key }) => point[key])), 1);

  const toggleSeries = (key: TrendSeriesKey) => {
    setHiddenSeries((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeDatum = activePoint === null ? null : data[activePoint];

  if (!data.length || !hasActivity) {
    return <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-muted">Últimos {data.length} días · basado en fechas reales de las tareas</p>
        {hiddenSeries.size ? (
          <button className="rounded-md px-2 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent-soft" type="button" onClick={() => setHiddenSeries(new Set())}>
            Restablecer series
          </button>
        ) : null}
      </div>

      {visibleSeries.length ? (
        <div className="overflow-hidden pb-1">
          <svg
            className="h-40 w-full"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label="Tendencia de tareas creadas, completadas y próximas a vencer"
          >
          {[0, 1, 2, 3].map((step) => {
            const y = PLOT_TOP + (PLOT_HEIGHT / 3) * step;
            const value = Math.round(maxValue - (maxValue / 3) * step);
            return (
              <g key={step} aria-hidden="true">
                <line x1={PLOT_LEFT} x2={CHART_WIDTH - PLOT_RIGHT} y1={y} y2={y} stroke="var(--border-primary)" strokeDasharray="3 5" />
                <text fill="var(--text-muted)" fontSize="10" textAnchor="end" x={PLOT_LEFT - 8} y={y + 3}>{value}</text>
              </g>
            );
          })}

          {visibleSeries.map((item) => (
            <g key={item.key}>
              <polyline
                className="transition-opacity duration-200"
                fill="none"
                points={data.map((point, index) => `${getX(index, data.length)},${getY(point[item.key], maxValue)}`).join(' ')}
                stroke={item.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              {data.map((point, index) => {
                const x = getX(index, data.length);
                const y = getY(point[item.key], maxValue);
                const isActive = activePoint === index;
                return (
                  <g key={`${item.key}-${point.dateKey}`}>
                    <circle
                      cx={x}
                      cy={y}
                      fill="transparent"
                      r="14"
                      tabIndex={0}
                      role="img"
                      aria-label={`${item.label}, ${point.label}: ${point[item.key]}`}
                      onFocus={() => setActivePoint(index)}
                      onBlur={() => setActivePoint(null)}
                      onMouseEnter={() => setActivePoint(index)}
                      onMouseLeave={() => setActivePoint(null)}
                    />
                    <circle cx={x} cy={y} fill={item.color} pointerEvents="none" r={isActive ? 5 : 3} />
                  </g>
                );
              })}
            </g>
          ))}

          {data.map((point, index) => (
            <text
              fill="var(--text-muted)"
              fontSize="10"
              key={point.dateKey}
              textAnchor="middle"
              x={getX(index, data.length)}
              y={CHART_HEIGHT - 12}
            >
              {index % 2 === 0 || index === data.length - 1 ? point.label : ''}
            </text>
          ))}
          </svg>
        </div>
      ) : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">Activa al menos una serie para ver la tendencia.</p>}

      <div className="min-h-10 rounded-lg bg-surface-elevated px-3 py-2 text-xs text-text-secondary" aria-live="polite">
        {activeDatum ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <strong className="text-text">{activeDatum.label}</strong>
            {series.filter(({ key }) => !hiddenSeries.has(key)).map((item) => <span className="inline-flex items-center gap-1.5" key={item.key}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}: <strong className="text-text">{activeDatum[item.key]}</strong></span>)}
          </div>
        ) : (
          'Pasa el cursor sobre un punto o enfócalo con el teclado para consultar el detalle del día.'
        )}
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Series de la gráfica">
        {series.map((item) => {
          const isVisible = !hiddenSeries.has(item.key);
          return (
            <button
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-surface-elevated ${isVisible ? 'border-border text-text' : 'border-border/60 text-text-muted line-through'}`}
              type="button"
              key={item.key}
              aria-pressed={isVisible}
              aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} serie ${item.label}`}
              onClick={() => toggleSeries(item.key)}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Datos de la tendencia de tareas</caption>
        <thead><tr><th>Fecha</th>{series.map((item) => <th key={item.key}>{item.label}</th>)}</tr></thead>
        <tbody>{data.map((point) => <tr key={point.dateKey}><th>{point.label}</th>{series.map((item) => <td key={item.key}>{point[item.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
};
