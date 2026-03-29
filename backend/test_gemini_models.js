require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });
  try {
    const result = await model.generateContent("Hello, respond with 'OK' if you can read this.");
    console.log(`[${modelName}] Success: `, result.response.text().trim());
  } catch (err) {
    console.error(`[${modelName}] Failed: `, err.message);
  }
}

async function run() {
  await testModel("gemini-2.0-flash");
  await testModel("gemini-1.5-flash");
  await testModel("gemini-1.5-pro");
}

run();
