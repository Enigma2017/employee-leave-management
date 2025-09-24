import express from 'express'
import 'dotenv/config'
import routes from './routes/routes.js'
const app = express()

// corses
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

app.use(express.json()) // Middleware to parse JSON bodies

app.use('/', routes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})