import routes from 'express' // import express
import { getAllUsers, createUsersTable, addUser } from '../services/users.services.js'
const router = routes.Router() // create a router instance

router.get('/', (req, res) => {
  res.send('Hello World from routes')
})

router.post('/data', (req, res) => {
  const receivedData = req.body
  console.log(receivedData)
  res.sendStatus(200)
}) // Endpoint to receive data

router.get('/testdb', async (req, res) => {
  await createUsersTable() // ensure the users table exists 
  // create random user data
  const randomName = `User${Math.floor(Math.random() * 1000)}`
  const randomEmail = `user${Math.floor(Math.random() * 1000)}@example.com`
  const randomRole = 'employee'
  const randomPassword = 'password123'
  // insert the random user into the database
  await addUser(randomName, randomEmail, randomRole, randomPassword)

  // get all users from the database and return as JSON
  const users = await getAllUsers()
  res.json(users)

  // create the users table if it doesn't exist
  await createUsersTable()

})

export default router
