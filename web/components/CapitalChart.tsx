'use client';

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
}

function fmtShort(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toLocaleString('cs-CZ', { maximumFractionDigits: 1 }) + ' mil';
  }
  if (value >= 1_000) {
    return (value / 1_000).toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) + ' tis';
  }
  return value.toLocaleString('cs-CZ');
}

function fmtCZK(value: number): string {
  return new Intl.NumberFormat('cs-CZ').format(Math.round(value)) + ' Kč';
}

export default function CapitalChart({ chartData, retirementAge, fv, rentaYears }: CapitalChartProps) {
  const peakPoint = chartData.reduce((max, p) => (p.value > max.value ? p : max), chartData[0] ?? { age: 0, value: 0 });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white/60 tracking-wide">Vývoj kapitálu v čase</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="capitalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a3e635" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a3e635" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'věk', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
          />
          <YAxis
            tickFormatter={fmtShort}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value) => [fmtCZK(Number(value)), 'Kapitál']}
            labelFormatter={(label) => `Věk ${label} let`}
            contentStyle={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, backgroundColor: '#1a1f35', color: '#fff' }}
          />
          <ReferenceLine
            x={retirementAge}
            stroke="#84cc16"
            strokeDasharray="4 3"
            strokeWidth={1.5}
          >
            <Label value="Důchod" position="insideTopRight" fontSize={11} fill="#84cc16" offset={4} />
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
            stroke="#84cc16"
            strokeWidth={2}
            fill="url(#capitalGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#84cc16' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-white/25">
        Zelená plocha = hodnota tvých investic. Spořící fáze končí v {retirementAge} letech, pak začíná výplata renty.
      </p>
    </div>
  );
}
