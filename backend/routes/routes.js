import routes from 'express' // import express
import { getAllUsers, createUsersTable, addUser, editUser, deleteUser } from '../services/users.services.js'
const router = routes.Router() // create a router instance
//(async () => await createUsersTable())() // ensure the users table exists
async function ensureUsersTable() {
  try {
    await createUsersTable()
  } catch (error) {
    console.error("Error creating users table:", error)
  }
}

ensureUsersTable();

router.get('/', (req, res) => {
  res.send('Hello World from routes')
})

router.get('/testdb', async (req, res) => {
  
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
  //await createUsersTable()

})

// users RESTful API endpoints
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// create a new user
router.post('/user', async (req, res) => {
  const { name, email, role, password } = req.body
  try {
    const newUser = await addUser(name, email, role, password)
    res.status(201).json(newUser)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error') 
  }
})

// edite a user
router.put('/user/:id', async (req, res) => {
  const { id } = req.params
  const { name, email, role, password } = req.body
  try {
    const updatedUser = await editUser(id, name, email, role, password)
    res.json(updatedUser)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')   
  }  
  
})

// delete a user
router.delete('/user/:id', async (req, res) => {
  const { id } = req.params
  try {
    await deleteUser(id)
    res.status(204).send() // No Content
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')   
  }
})


export default router
