require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // The SDK doesn't have a direct listModels but we can try common ones
  const models = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash"
  ];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("test");
      console.log(`Model WORKING: ${m}`);
    } catch (e) {
      console.log(`Model FAILED: ${m} - ${e.message}`);
    }
  }
}
run();
