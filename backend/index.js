import express from 'express'
import 'dotenv/config'
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
app.post('/data', (req, res) => {
  const receivedData = req.body
  console.log(receivedData)
  res.sendStatus(200)
}) // Endpoint to receive data

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})