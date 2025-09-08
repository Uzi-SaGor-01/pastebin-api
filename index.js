import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Pastebin Raw API is running!");
});

app.get("/raw/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://pastebin.com/raw/${id}`);
    if (!response.ok) {
      return res.status(404).json({ error: "Paste not found!" });
    }
    const text = await response.text();
    res.type("text/plain").send(text);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
