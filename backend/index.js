import express from 'express'
import 'dotenv/config'
import routes from './routes/routes.js'
import cookieParser from 'cookie-parser';
import cors from "cors";
const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json())
app.use(cookieParser());

app.use('/', routes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})