import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize providers
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AnalysisResponse {
  bias_score: number;             // 0-10
  flagged_issues: string[];
  explanation: string;
  improved_questions: string[];
  is_fallback?: boolean;          // Internal flag for UI warning
}

const SYSTEM_PROMPT = `You are an expert HR compliance officer. Analyze the following interview questions for bias.
Return ONLY a valid JSON object with:
{
  "bias_score": number (0-10, where 10 is most biased),
  "flagged_issues": ["issue 1", "issue 2"],
  "explanation": "concise explanation of risks",
  "improved_questions": ["better version 1", "better version 2"]
}`;

/**
 * Main AI Pipeline
 * 1. Gemini (Primary)
 * 2. OpenAI (Secondary)
 * 3. Rule-based (Safety)
 */
export async function analyzeQuestionsWithAI(text: string): Promise<AnalysisResponse> {
  // 1. Try Gemini
  try {
    console.log("AI Pipeline: Trying Gemini...");
    const result = await withTimeout(callGemini(text), 6000);
    return { ...result, is_fallback: false };
  } catch (e: any) {
    console.error("AI Pipeline: Gemini failed:", e.message || e);
    
    // 2. Try OpenAI (Fallback)
    try {
      console.log("AI Pipeline: Falling back to OpenAI...");
      const result = await withTimeout(callOpenAI(text), 6000);
      return { ...result, is_fallback: false };
    } catch (e2: any) {
      console.error("AI Pipeline: OpenAI failed:", e2.message || e2);
      
      // 3. Rule-based Safety Fallback (Always returns valid response)
      console.log("AI Pipeline: Triggering Rule-based fallback...");
      return generateRuleBasedFallback(text);
    }
  }
}

async function callGemini(text: string): Promise<AnalysisResponse> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `${SYSTEM_PROMPT}\n\nAnalyze these questions:\n\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  
  return JSON.parse(rawText);
}

async function callOpenAI(text: string): Promise<AnalysisResponse> {
  // Catch 429 quota errors early
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze these questions:\n\n${text}` },
      ],
    });

    const output = completion.choices[0].message.content;
    if (!output) throw new Error("Empty OpenAI response");
    return JSON.parse(output);
  } catch (e: any) {
    if (e.status === 429 || e.message?.includes("quota")) {
      console.error("OpenAI: Quota exceeded, skipping retries.");
      throw new Error("OpenAI Quota Exceeded");
    }
    throw e;
  }
}

/**
 * Final safety net: Basic keyword matching bias detection
 */
function generateRuleBasedFallback(text: string): AnalysisResponse {
  const lowercaseText = text.toLowerCase();
  const biasKeywords = [
    { word: "aggressive", issue: "Aggressive tone may deter collaborative candidates." },
    { word: "young", issue: "Age-related bias: Focusing on 'young' energy can be discriminatory." },
    { word: "dominant", issue: "Gender-coded language: 'Dominant' can imply a non-inclusive environment." },
    { word: "bro culture", issue: "Cultural bias: 'Bro culture' suggests a non-diverse, exclusionary workplace." },
    { word: "late nights", issue: "Lifestyle bias: Questioning flexibility/late nights impacts caregivers and older workers." },
    { word: "fast-paced", issue: "Potential ableism: Can be perceived as excluding those with different work paces." },
    { word: "fit into", issue: "Culture-fit bias: Testing for 'fit' often leads to hiring people similar to current employees." }
  ];

  const foundIssues: string[] = [];
  biasKeywords.forEach(kb => {
    if (lowercaseText.includes(kb.word)) {
      foundIssues.push(kb.issue);
    }
  });

  const score = foundIssues.length > 0 ? Math.min(foundIssues.length * 2, 8) : 1;
  const explanation = foundIssues.length > 0 
    ? "Analysis completed with limited insights due to AI availability. Keywords associated with bias were detected."
    : "Analysis completed with basic checks. No immediate high-risk biased keywords were found.";

  return {
    bias_score: score,
    flagged_issues: foundIssues.length > 0 ? foundIssues : ["No high-risk keywords detected, but deeper analysis was limited."],
    explanation,
    improved_questions: [
      "Instead of 'fit', ask: 'How does your work style complement our team values?'",
      "Instead of 'aggressive', ask: 'How do you prioritize high-impact tasks under deadlines?'"
    ],
    is_fallback: true
  };
}

/**
 * Utility to wrap a promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}
