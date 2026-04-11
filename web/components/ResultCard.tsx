'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultCardProps {
  title: string;
  amount: number;
  subtitle: string;
  extra?: string;
}

function formatCZK(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
}

export default function ResultCard({ title, amount, subtitle, extra }: ResultCardProps) {
  return (
    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl shadow-black/30 flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-white/40 uppercase tracking-widest">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-3xl font-bold leading-none bg-gradient-to-br from-lime-300 to-emerald-400 bg-clip-text text-transparent">
          {formatCZK(amount)}
          <span className="text-base font-normal text-white/30 ml-1">/měsíc</span>
        </p>
        <p className="text-xs text-white/35">{subtitle}</p>
        {extra && <p className="text-xs text-white/50 pt-1 border-t border-white/8 mt-2">{extra}</p>}
      </CardContent>
    </Card>
  );
}
