import express from 'express'
const router = express.Router()
import { protect } from '../middleware/authMiddleware.js'
import { addProduct, updateProduct,getCart, deleteProduct } from '../controllers/cartController.js'

router.route("/").get(protect, getCart)
router.route("/add").post(protect, addProduct)
router.route("/update/:id").put(protect, updateProduct)
router.route("/delete/:id").delete(protect, deleteProduct)

export default router