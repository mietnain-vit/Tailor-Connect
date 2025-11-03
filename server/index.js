require('dotenv').config()
const express = require('express')
const Stripe = require('stripe')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 4242
const stripeSecret = process.env.STRIPE_SECRET_KEY
if (!stripeSecret) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Checkout endpoints will fail until configured.')
}
const stripe = Stripe(stripeSecret || '')

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Create a Stripe Checkout session for a deposit
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { orderId, amount, currency = 'inr' } = req.body
    if (!orderId || !amount) return res.status(400).json({ error: 'orderId and amount required' })

    const successUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/payments/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${orderId}`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { name: `Deposit for order ${orderId}` },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId: String(orderId) },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error', err)
    res.status(500).json({ error: 'Internal error creating checkout session' })
  }
})

// Retrieve session details (used by frontend success page)
app.get('/checkout-session', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || req.query.session_id
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' })
    const session = await stripe.checkout.sessions.retrieve(String(sessionId))
    res.json(session)
  } catch (err) {
    console.error('checkout-session error', err)
    res.status(500).json({ error: 'Internal error retrieving session' })
  }
})

app.listen(port, () => console.log(`Stripe server listening on ${port}`))
