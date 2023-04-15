import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import cors from 'cors';
import connectDB from "./config/db"

const app = express()
const PORT = process.env.PORT || 6000
dotenv.config()

connectDB()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())