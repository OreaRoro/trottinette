const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // clé secrète stripe test

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const { reservationId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Location trottinette",
            },
            unit_amount: 200, // 2.00 €
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/payment-success?reservationId=${reservationId}`,
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("Stripe backend running on port 4242"));
