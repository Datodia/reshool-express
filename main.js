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



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null,  Date.now() + path.extname(file.originalname))
//     }
// })

// const upload = multer({storage})


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


// npm i express mongoose bcrypt dotenv jsonwebtoken joi