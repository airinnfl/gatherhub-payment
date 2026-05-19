require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    hasKey: !!process.env.MIDTRANS_SERVER_KEY,
  });
});

// Midtrans route
app.post("/create-transaction", async (req, res) => {
  try {
    const midtransClient = require("midtrans-client");

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const { eventName, price } = req.body;

    const amount = Math.max(Number(price) || 0, 1000);

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: amount,
      },
      item_details: [
        {
          id: "EVENT",
          name: eventName || "Event Ticket",
          price: amount,
          quantity: 1,
        },
      ],
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
