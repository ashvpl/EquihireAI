"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface QuestionInputProps {
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function QuestionInput({ onAnalyze, isLoading }: QuestionInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onAnalyze(text);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Paste your interview questions here (e.g., 'Are you planning to start a family soon?' or 'We need someone young and energetic for this role')..."
          className="min-h-[200px] text-lg p-6 bg-slate-50 border-slate-200 focus:bg-white transition-all resize-none shadow-sm rounded-xl"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-400">
          {text.length} / 5000 characters
        </div>
      </div>
      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={isLoading || !text.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 rounded-xl shadow-md transition-all group"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            AI is Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Analyze for Bias
          </>
        )}
      </Button>
    </div>
  );
}
