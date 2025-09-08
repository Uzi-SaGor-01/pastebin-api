const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/search", async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) return res.status(400).json({ error: "Please provide a keyword" });

    try {
        const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keyword)}`;
        const { data: html } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });

        const $ = cheerio.load(html);
        const pins = [];

        $("img").each((i, el) => {
            if (pins.length >= 30) return false;
            const img = $(el).attr("src");
            const title = $(el).attr("alt") || "";
            if (img && !img.includes("236x")) pins.push({ title, image: img });
        });

        // Response text
        let responseText = `Found ${pins.length} pins for keyword: "${keyword}"\n\n`;
        pins.forEach((pin, index) => {
            responseText += `${index + 1}. ${pin.title || "No Title"}\n${pin.image}\n\n`;
        });

        return res.json({
            keyword,
            count: pins.length,
            pins,
            text: responseText.trim()
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Failed to fetch Pinterest pins" });
    }
});

app.listen(PORT, () => console.log(`Pinterest Scraper API running on port ${PORT}`));
