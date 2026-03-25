"use client";

import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl animate-pulse opacity-50"></div>
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin relative" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-semibold text-slate-700">AI is analyzing your questions...</p>
        <p className="text-sm text-slate-500">Checking for gender, age, and cultural bias patterns.</p>
      </div>
    </div>
  );
}
