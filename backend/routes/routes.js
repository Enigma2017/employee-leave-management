import routes from 'express' // import express
const router = routes.Router() // create a router instance

router.get('/', (req, res) => {
  res.send('Hello World from routes')
})

router.post('/data', (req, res) => {
  const receivedData = req.body
  console.log(receivedData)
  res.sendStatus(200)
}) // Endpoint to receive data

export default router
