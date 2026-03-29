require("dotenv").config();
const { generateKit } = require("./services/aiService");

async function testSingleRole() {
  const role = "mechanic";
  console.log(`\nTesting role: ${role}`);
  try {
    const kit = await generateKit(role, "mid-level", "auto shop", "standard");
    console.log(JSON.stringify(kit, null, 2));
  } catch (err) {
    console.error(`Error for role ${role}:`, err.message);
  }
}

testSingleRole();
