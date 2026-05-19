require("dotenv").config();

const express = require("express");
const cors = require("cors");
const midtransClient = require("midtrans-client");

const app = express();

app.use(cors());
app.use(express.json());

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

app.post("/create-transaction", async (req, res) => {
  try {
    const { eventName, price } = req.body;

    // Validasi data
    if (!eventName) {
      return res.status(400).json({
        error: "eventName is required",
      });
    }

    if (!process.env.MIDTRANS_SERVER_KEY) {
      return res.status(500).json({
        error: "MIDTRANS_SERVER_KEY is not set",
      });
    }

    const orderId = "ORDER-" + Date.now();

    // Pastikan harga berupa angka dan minimal 1000
    const amount = Math.max(Number(price) || 0, 1000);

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: "EVENT",
          name: eventName,
          price: amount,
          quantity: 1,
        },
      ],
    };

    console.log("Creating transaction:", parameter);

    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);

    res.status(500).json({
      error: error.message,
      details: error.ApiResponse || null,
    });
  }
});

// Optional: test endpoint
app.get("/", (req, res) => {
  res.send("GatherHub Midtrans Backend is running!");
});

// WAJIB gunakan PORT dari Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
