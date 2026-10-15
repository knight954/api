
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/currency", async (req, res) => {
    try {
        const { from, to, amount } = req.query;

        if (!from || !to || !amount) {
            return res.status(400).json({
                error: "Enter from, to and amount"
            });
        }

        if (Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
            return res.status(400).json({
                error: "Amount must be a positive number"
            });
        }

        const url = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}/pair/${encodeURIComponent(from.toUpperCase())}/${encodeURIComponent(to.toUpperCase())}/${Number(amount)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.result !== "success") {
            return res.status(400).json({
                error: data["error-type"] || "Unable to convert currency"
            });
        }

        res.json({
            from: data.base_code,
            to: data.target_code,
            amount: Number(amount),
            exchange_rate: data.conversion_rate,
            converted_amount: data.conversion_result
        });

    } catch (error) {
        res.status(500).json({
            error: "Server error. Try again."
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
