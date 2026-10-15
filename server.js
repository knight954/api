
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());

const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!ACCESS_TOKEN) {
            return res.status(500).json({ error: "Dropbox access token is not configured" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file selected" });
        }

        const response = await fetch(
            "https://content.dropboxapi.com/2/files/upload",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ACCESS_TOKEN}`,
                    "Dropbox-API-Arg": JSON.stringify({
                        path: "/" + req.file.originalname,
                        mode: "add",
                        autorename: true
                    }),
                    "Content-Type": "application/octet-stream"
                },
                body: req.file.buffer
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error_summary || "Dropbox upload failed" });
        }

        res.json({ message: "Uploaded successfully", name: data.name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
