import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from "./config/db.js"
import authRoute from './routes/authRoutes.js'
import productRoute from './routes/productRoute.js'

const app = express()
const PORT = process.env.PORT || 5500
dotenv.config()

connectDB()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use("/auth", authRoute)
app.use("/products", productRoute)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})