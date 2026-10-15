
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

dotenv.config();

const app = express();
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[\\/?:*"<>|]/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/api/upload", upload.array("files", 1000), (req, res) => {
    const uploadedFiles = (req.files || []).map((file) => ({
        originalName: file.originalname,
        relativePath: file.originalname,
        size: file.size,
        savedPath: file.path
    }));

    res.json({
        message: uploadedFiles.length ? "Files uploaded successfully" : "No files uploaded",
        files: uploadedFiles
    });
});

app.get("/api/weather", async (req, res) => {
    try {
        const city = req.query.city;

        if (!city) {
            return res.status(400).json({ error: "Enter a city name" });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.message || "Unable to fetch weather"
            });
        }

        res.json({
            city: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            feels_like: data.main.feels_like,
            wind_speed: data.wind.speed
        });
    } catch (error) {
        res.status(500).json({ error: "Server error. Try again." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
