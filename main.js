const express = require('express')
const userRouter = require('./users/user.route')
const connectToDb = require('./db/connectToDB')
const authRouter = require('./auth/auth.route')
const isAuth = require('./middlewares/isAuth.middleware')
const postRouter = require('./posts/posts.route')
const app = express()
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const { upload } = require('./config/clodinary.config')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const swagger = require('./swagger.js')
const stripeRouter = require('./stripe/stripe.route')
const stripe = require('./config/stripe.config.js')
const orderModel = require('./models/order.model.js')



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null,  Date.now() + path.extname(file.originalname))
//     }
// })

// const upload = multer({storage})

app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_KEY)
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }


    if (event.type === 'checkout.session.completed') {
        await orderModel.findOneAndUpdate({ sessionId: event.data.object.id }, { status: 'SUCCESS' })
    }
    if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object
        const session = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id })
        if (session.data.length > 0) {
            const sessionId = session.data[0].id
            await orderModel.findOneAndUpdate({ sessionId }, { status: 'REJECTED' })
        }
    }
    if (event.type === 'checkout.session.expired') {
        const session = event.data.object
        await orderModel.findOneAndUpdate({ sessionId: session.id }, { status: 'REJECTED' })
    }

    res.send({ revieced: true })
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'))


const specs = swaggerJSDoc(swagger)
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))

app.use('/users', isAuth, userRouter)
app.use('/posts', isAuth, postRouter)
app.use('/auth', authRouter)
app.use('/stripe', stripeRouter)

app.post('/upload', upload.single('image'), (req, res) => {
    res.send(req.file)
})

app.get('/', (req, res) => {
    res.send(
        `
            <h1>Hello World</h1>
            <a href="/docs">Docs</a>
        `
    )
})

connectToDb().then(res => {
    app.listen(3000, () => {
        console.log(`server running on http://localhost:3000`)
    })
})


// npm i express mongoose bcrypt dotenv jsonwebtoken joi stripe