import express from 'express'
const router = express.Router()
import { protect } from '../middleware/authMiddleware.js'
import { registerUser, loginUser, getCredentials, updateUser, forgotPassword } from '../controllers/authController.js'
router.route("/credentials").get(protect, getCredentials)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/update/:id").put(updateUser)
router.route("/forgot-password").put(forgotPassword)

export default router