require('dotenv').config()
const express = require('express')
const Stripe = require('stripe')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const port = process.env.PORT || 4242
const stripeSecret = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!stripeSecret) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Checkout endpoints will fail until configured.')
}
const stripe = Stripe(stripeSecret || '')

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// JSON orders DB (demo)
const DB_PATH = path.join(__dirname, 'orders.json')
function readOrders() {
  try {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]')
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (e) { return [] }
}
function writeOrders(data) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) } catch (e) { console.error('Failed to write orders.json', e) }
}

// For Stripe webhook we need raw body; mount raw parser on webhook route below
app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

// Create a Stripe Checkout session for a deposit (legacy / optional)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { orderId, amount, currency = 'inr' } = req.body
    if (!orderId || !amount) return res.status(400).json({ error: 'orderId and amount required' })

    const successUrl = `${CLIENT_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${CLIENT_URL}/orders/${orderId}`

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

// Create PaymentIntent for in-app card collection
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { orderId, amount, currency = 'inr' } = req.body
    if (!orderId || !amount) return res.status(400).json({ error: 'orderId and amount required' })
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      metadata: { orderId: String(orderId) },
    })
    res.json({ clientSecret: pi.client_secret })
  } catch (err) {
    console.error('create-payment-intent error', err)
    res.status(500).json({ error: 'Internal error creating payment intent' })
  }
})

// Webhook handler (raw body)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    if (!stripeWebhookSecret) {
      // If webhook secret is not configured, attempt to parse but do NOT trust signature
      event = JSON.parse(req.body.toString())
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret)
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object
      const orderId = intent.metadata && intent.metadata.orderId
      if (orderId) {
        const orders = readOrders()
        const updated = orders.map(o => (String(o.id) === String(orderId) ? { ...o, status: 'in-progress', paid: true, depositAmount: Math.round((intent.amount_received || intent.amount) / 100) } : o))
        writeOrders(updated)
        // Optionally emit something or log
        console.log(`Order ${orderId} marked paid (webhook)`)
      }
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object
      const orderId = session.metadata && session.metadata.orderId
      if (orderId) {
        const orders = readOrders()
        const updated = orders.map(o => (String(o.id) === String(orderId) ? { ...o, status: 'in-progress', paid: true, depositAmount: Math.round((session.amount_total || 0) / 100) } : o))
        writeOrders(updated)
        console.log(`Order ${orderId} marked paid (checkout.session.completed)`)      }
      break
    }
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
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
