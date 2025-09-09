const fs = require("fs-extra");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

module.exports = async (req, res) => {
  // শুধুমাত্র POST request
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { mediaUrl } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: "mediaUrl required" });

    const ext = path.extname(mediaUrl).toLowerCase();
    const tmpFile = `/tmp/${Date.now()}${ext}`;

    // Download media
    const response = await axios.get(mediaUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(tmpFile, response.data);

    let uploadLink = "";

    if (ext === ".jpg" || ext === ".png" || ext === ".gif") {
      // ImgBB Upload
      const imageData = fs.readFileSync(tmpFile, { encoding: "base64" });
      const imgbbKey = "67124e33d2ab5ff5577e545e0da19dde"; // direct key

      const imgbbRes = await axios.post("https://api.imgbb.com/1/upload", null, {
        params: { key: imgbbKey, image: imageData }
      });

      uploadLink = imgbbRes.data.data.url;

    } else if (ext === ".mp4" || ext === ".webm") {
      // Catbox Upload
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(tmpFile));

      const catboxRes = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
      uploadLink = catboxRes.data;

    } else {
      fs.unlinkSync(tmpFile);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(tmpFile);
    return res.status(200).json({ link: uploadLink });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
};
