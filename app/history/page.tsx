"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronRight, Loader2 } from "lucide-react";
import { RiskIndicator } from "@/components/RiskIndicator";
import { format } from "date-fns";

export default function HistoryPage() {
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.history || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Analysis History</h2>
                <p className="text-slate-500">Track and review all previous interview question analyses.</p>
              </div>
              <div className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                {history.length} Reports Total
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <Card className="border-dashed border-2 p-12 text-center bg-transparent">
                <div className="space-y-4">
                  <div className="mx-auto h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">No reports found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Start by analyzing your first set of interview questions in the dashboard.</p>
                  </div>
                  <Link href="/dashboard" className="text-indigo-600 font-semibold hover:underline inline-block pt-2">
                    Go to Analyze →
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {history.map((report) => (
                  <Link key={report.id} href={`/report/${report.id}`}>
                    <Card className="hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden border-slate-200">
                      <CardContent className="p-0">
                        <div className="flex items-center p-5">
                          <div className="flex-shrink-0 mr-6 text-center w-12 border-r pr-6 border-slate-100 flex flex-col justify-center">
                            <span className="text-2xl font-bold text-indigo-600 leading-tight">
                              {report.bias_score}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Score</span>
                          </div>
                          
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="text-slate-900 font-semibold truncate mb-1">
                              &quot;{report.input_text.slice(0, 80)}...&quot;
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(report.created_at), "MMM d, yyyy • h:mm a")}
                              </span>
                              <RiskIndicator level={report.risk_level} />
                            </div>
                          </div>

                          <div className="flex-shrink-0 h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
