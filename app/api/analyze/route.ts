import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { analyzeQuestionsWithAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Input text is too short" }, { status: 400 });
    }

    // 1. Run AI/Fallback Pipeline
    console.log("Analyzing questions...");
    const aiResponse = await analyzeQuestionsWithAI(text);
    console.log("Analysis complete.");

    // 2. Map Standardized Response to Supabase Schema
    // Scale bias_score 0-10 to 0-100 for existing UI compatibility if needed
    const normalizedScore = aiResponse.bias_score * 10;
    
    let riskLevel = "Low";
    if (normalizedScore > 7) riskLevel = "High";
    else if (normalizedScore > 4) riskLevel = "Medium";

    const { data, error } = await supabase
      .from("analysis_reports")
      .insert([
        {
          user_id: userId,
          input_text: text,
          bias_score: normalizedScore,
          risk_level: riskLevel,
          categories: { 
            explanation: aiResponse.explanation,
            is_fallback: aiResponse.is_fallback || false,
            // Mock empty categories for structure compatibility
            gender_bias: 0, age_bias: 0, cultural_bias: 0, tone_bias: 0
          },
          flagged_phrases: aiResponse.flagged_issues.map(issue => ({
            text: "Issue Detected",
            reason: issue,
            severity: normalizedScore > 70 ? "high" : "medium"
          })),
          rewritten_output: aiResponse.improved_questions,
          diversity_impact: aiResponse.explanation,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error details:", error);
      return NextResponse.json({ error: "Failed to save report: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: "Internal processing error occurred." }, { status: 500 });
  }
}
