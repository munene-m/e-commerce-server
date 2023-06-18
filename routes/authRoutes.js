import express from 'express'
const router = express.Router()
import { protect } from '../middleware/authMiddleware.js'
import { registerUser, loginUser, getCredentials, updateUser, forgotPassword, googleAuthCallback, resetPassword } from '../controllers/authController.js'
router.route("/credentials").get(protect, getCredentials)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/update/:id").put(updateUser)
router.route("/forgot-password").put(forgotPassword)
router.route("/reset").post(resetPassword)
router.route("/oauth/callback").get(googleAuthCallback)

export default router