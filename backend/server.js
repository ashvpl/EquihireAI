const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*"
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});
