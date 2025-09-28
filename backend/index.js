import express from 'express'
import 'dotenv/config'
import routes from './routes/routes.js'
import cookieParser from 'cookie-parser';
import cors from "cors";
const app = express()

app.use(cors({
  origin: "http://localhost:5173", // адрес фронтенда
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // <- вот это ключевое для отправки cookies
}));

app.use(express.json()) // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use('/', routes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})