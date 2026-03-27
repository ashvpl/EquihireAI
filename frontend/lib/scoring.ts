export function computeScoring(aiOutput: any) {
  // Normalize and validate AI output.
  let overallScore = aiOutput.overall_bias_score || 0;
  
  // Ensure we bounds check to 0-100
  overallScore = Math.max(0, Math.min(100, overallScore));
  
  // Explicitly calculate risk level based on the rule: Name -> 0-30 Low, 31-70 Medium, 71-100 High
  let riskLevel = "Low";
  if (overallScore > 70) {
    riskLevel = "High";
  } else if (overallScore > 30) {
    riskLevel = "Medium";
  }

  return {
    ...aiOutput,
    overall_bias_score: overallScore,
    risk_level: riskLevel,
  };
}
