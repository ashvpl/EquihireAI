import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeQuestionsWithAI } from "@/lib/ai";
import { computeScoring } from "@/lib/scoring";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || text.trim() === "" || text.length > 5000) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 1. Run AI analysis
    const aiOutput = await analyzeQuestionsWithAI(text);
    
    // 2. Compute/Validate scores
    const finalResult = computeScoring(aiOutput);

    // 3. Save to Supabase
    const { data, error } = await supabase
      .from("analysis_reports")
      .insert([
        {
          user_id: userId,
          input_text: text,
          bias_score: finalResult.overall_bias_score,
          risk_level: finalResult.risk_level,
          categories: finalResult.categories,
          flagged_phrases: finalResult.flagged_phrases,
          rewritten_output: finalResult.rewritten_questions,
          diversity_impact: finalResult.diversity_impact,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    // Return the saved report, which has the ID and matching fields
    return NextResponse.json({ report: data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
