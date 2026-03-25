import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are an expert in HR compliance and hiring bias detection. 
Your task is to analyze the following interview questions for hidden bias. 
Identify issues across gender, age, cultural, and tone, assign severity scores (0 to 100, where 100 is highly biased), and rewrite the questions to be inclusive. 
Return ONLY structured JSON matching this exact format:
{
  "overall_bias_score": number (0-100),
  "risk_level": "Low" | "Medium" | "High",
  "categories": {
    "gender_bias": number (0-100),
    "age_bias": number (0-100),
    "cultural_bias": number (0-100),
    "tone_bias": number (0-100)
  },
  "flagged_phrases": [
    {
      "text": "extract the exact phrase",
      "reason": "short explanation",
      "severity": "low" | "medium" | "high"
    }
  ],
  "rewritten_questions": [
    "inclusive alternative 1",
    "inclusive alternative 2"
  ],
  "diversity_impact": "1-2 sentences on how this impacts candidate diversity"
}`;

export async function analyzeQuestionsWithAI(text: string) {
  try {
    // 1. Try OpenAI (GPT-4o-mini)
    return await callOpenAI(text);
  } catch (error) {
    console.error("OpenAI failed, falling back to Gemini", error);
    try {
      // 2. Fallback to Gemini
      return await callGemini(text);
    } catch (geminiError) {
      console.error("Gemini also failed", geminiError);
      throw new Error("Failed to analyze questions using AI.");
    }
  }
}

async function callOpenAI(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze these interview questions:\n\n${text}` },
    ],
  });

  const output = completion.choices[0].message.content;
  if (!output) throw new Error("Empty response from OpenAI");
  return JSON.parse(output);
}

async function callGemini(text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `${SYSTEM_PROMPT}\n\nAnalyze these interview questions:\n\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();
  
  // Clean up markdown formatting if Gemini wrapped it in ```json
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanedText);
}
