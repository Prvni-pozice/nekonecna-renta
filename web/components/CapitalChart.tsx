'use client';

import { useDict } from '@/lib/dict-context';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Label,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { ChartPoint } from '@/lib/calculations';

interface CapitalChartProps {
  chartData: ChartPoint[];
  retirementAge: number;
  fv: number;
  rentaYears: number;
  hasRealValue?: boolean;
}

export default function CapitalChart({
  chartData,
  retirementAge,
  fv,
  rentaYears,
  hasRealValue = false,
}: CapitalChartProps) {
  const dict = useDict();
  const fmtShort = dict.fmtShort;
  const fmtCZK = dict.fmt;
  const peakPoint = chartData.reduce(
    (max, p) => (p.value > max.value ? p : max),
    chartData[0] ?? { age: 0, value: 0 }
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white/60 tracking-wide">{dict.chartTitle}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="capitalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a3e635" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a3e635" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="age"
            type="number"
            domain={[chartData[0]?.age ?? 0, chartData[chartData.length - 1]?.age ?? 0]}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
            tickLine={false}
            axisLine={false}
            label={{ value: dict.chartAge, position: 'insideBottomRight', offset: -4, fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
          />
          <YAxis
            tickFormatter={fmtShort}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value, name) => {
              const labelText =
                name === 'realValue' ? dict.chartCapitalReal : dict.chartCapital;
              return [fmtCZK(Number(value)), labelText];
            }}
            labelFormatter={(label) => dict.chartAgeLabel(Number(label))}
            contentStyle={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, backgroundColor: '#1a1f35', color: '#fff' }}
          />
          <ReferenceLine
            x={retirementAge}
            stroke="#84cc16"
            strokeDasharray="4 3"
            strokeWidth={1.5}
          >
            <Label value={dict.chartRetirement} position="insideTopRight" fontSize={11} fill="#84cc16" offset={4} />
          </ReferenceLine>
          {peakPoint && (
            <ReferenceDot
              x={peakPoint.age}
              y={peakPoint.value}
              r={4}
              fill="#84cc16"
              stroke="white"
              strokeWidth={2}
              label={{ value: fmtCZK(fv), position: 'top', fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            name={dict.chartCapital}
            stroke="#84cc16"
            strokeWidth={2}
            fill="url(#capitalGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#84cc16' }}
          />
          {hasRealValue && (
            <Area
              type="monotone"
              dataKey="realValue"
              name={dict.chartCapitalReal}
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#realGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#fbbf24' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-lime-400 rounded" />
          {dict.chartLegendNominal}
        </span>
        {hasRealValue && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded" style={{ borderTop: '1px dashed #fbbf24' }} />
            {dict.chartLegendReal}
          </span>
        )}
      </div>
      <p className="text-xs text-white/25">{dict.chartNote(retirementAge)}</p>
    </div>
  );
}
