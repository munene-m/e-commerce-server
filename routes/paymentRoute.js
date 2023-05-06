import express from 'express'
const router = express.Router()
import { generateToken } from '../middleware/paymentMiddleware.js'
import { makePayment } from '../controllers/paymentController.js'

router.route("/stk").post(generateToken, makePayment)

export default router