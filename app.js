import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { connectDB } from "./config/db.js"
import authRoute from './routes/authRoutes.js'
import productRoute from './routes/productRoute.js'
import cartRoute from './routes/cartRoute.js'
import paymentRoute from './routes/paymentRoute.js'

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
app.use("/cart", cartRoute)
app.use("/pay", paymentRoute)

// Serve static files from the 'dist' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes and return the 'index.html' file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})