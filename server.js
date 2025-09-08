const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;

app.use(express.json());

app.get("/search", async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) return res.status(400).json({ error: "Please provide a keyword" });

    try {
        const response = await axios.get(`https://api.pinterest.com/v5/search/pins?query=${encodeURIComponent(keyword)}&page_size=30`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        });

        const pins = response.data.items.map(pin => ({
            title: pin.title,
            image: pin.media?.images?.originals?.url || null
        })).filter(pin => pin.image != null);

        return res.json({ keyword, count: pins.length, pins });
    } catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to fetch Pinterest pins" });
    }
});

app.listen(PORT, () => console.log(`Pinterest API running on port ${PORT}`));
