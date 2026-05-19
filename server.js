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

    const orderId = "ORDER-" + Date.now();

    // Pastikan amount minimal 1000
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
    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
