import express from 'express';
import { getAllUsers, createUsersTable, addUser, editUser, deleteUser } from '../services/users.services.js';
import {
  createVacationsTable,
  getAllVacations,
  editVacation,
  deleteVacation,
  checkVacation,
  createVacationWithCheck,
  calculateCompensation
} from '../services/vacation.service.js';
import { signIn } from '../services/auth.services.js'; 

const router = express.Router();

// creating the table of users and vacations
async function ensureTables() {
  try {
    await createUsersTable();
    await createVacationsTable();
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}
ensureTables();

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers(req.query.role);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/user', async (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    const newUser = await addUser(name, email, role, password);
    if (!newUser) return res.status(400).send('Error creating user');
    res.status(201).json({ data: newUser, status: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;
  try {
    const updatedUser = await editUser(id, name, email, role, password);
    if (!updatedUser) return res.status(400).send('Error editing user');
    res.status(200).json({ data: updatedUser, status: 'User edited successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUser(id);
    res.status(200).send('User deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// --- VACATIONS ---
router.get('/vacations', async (req, res) => {
  try {
    const vacations = await getAllVacations();
    res.json(vacations);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/vacations/create', async (req, res) => {
  const { userId, start_date, end_date } = req.body;
  try {
    const result = await createVacationWithCheck(userId, start_date, end_date);

    if (!result.allowed) {
      return res.status(400).json({ error: result.reason });
    }

    // returning all vacations of the user to have fresh data on the frontend
    res.status(201).json({
      vacation: result.vacation,
      vacations: result.vacations,
      paidDays: result.paidDays,
      unpaidDays: result.unpaidDays,
      compensation: result.compensation
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/vacations/check', async (req, res) => {
  const { userId, start_date, end_date } = req.body;
  try {
    const result = await checkVacation(userId, start_date, end_date);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/vacations/calculate', async (req, res) => {
  const { userId, start, end } = req.query;
  try {
    const result = await calculateCompensation(userId, start, end);
    if (!result.allowed) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/vacations/:id', async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date, status } = req.body;
  try {
    const updatedVacation = await editVacation(id, start_date, end_date, status);
    if (!updatedVacation) return res.status(400).send('Error editing vacation');
    res.status(200).json({ data: updatedVacation, status: 'Vacation updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/vacations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteVacation(id);
    res.status(200).send('Vacation deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// --- AUTH ---
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await signIn(email, password);
    if (!result.success) return res.status(400).send('Invalid email or password')
      else {
      // set headers http only refresh token
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        }); 

        const answerData = { accessToken: result.accessToken };
        
        return res.status(200).json(answerData);
      };
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
