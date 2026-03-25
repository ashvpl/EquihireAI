"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BiasScoreCardProps {
  score: number;
}

export function BiasScoreCard({ score }: BiasScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s <= 30) return "text-emerald-500 border-emerald-100 bg-emerald-50";
    if (s <= 70) return "text-amber-500 border-amber-100 bg-amber-50";
    return "text-red-500 border-red-100 bg-red-50";
  };

  return (
    <Card className={cn("overflow-hidden border-2", getScoreColor(score).split(" ").slice(1).join(" "))}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall Bias Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className={cn("text-5xl font-bold tracking-tighter", getScoreColor(score).split(" ")[0])}>
            {score}
          </span>
          <span className="text-slate-400 font-medium">/ 100</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Lower is better. A score above 70 indicates high legal and diversity risk.
        </p>
      </CardContent>
    </Card>
  );
}
