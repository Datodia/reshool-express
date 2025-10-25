const { Router } = require("express");
const stripe = require("../config/stripe.config");

const stripeRouter = Router()


stripeRouter.post('/buy-phone',async (req, res) => {
    const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: 'price_1Rb4qwEWaHsE9wj75fpgOUsx',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://localhost:5173/?success=true`,
    cancel_url: `http://localhost:5173/?canceled=true`,
  });

  res.json({url: session.url})
})

stripeRouter.post('/checkout',async (req, res) => {
    const { productName, amount, description} = req.body
    const session = await stripe.checkout.sessions.create({
    line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName, // dynamically passed from client
              images: ["https://example.com/hoodie.png"], // optional
              description
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
    mode: 'payment',
    success_url: `http://localhost:5173/?success=true`,
    cancel_url: `http://localhost:5173/?canceled=true`,
  });

  res.json({url: session.url})
})


module.exports = stripeRouter