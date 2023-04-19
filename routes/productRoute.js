import express from 'express'
import { protect } from '../middleware/authMiddleware'
import { createProduct, updateProduct, deleteProduct, getProducts } from '../controllers/productController'
const router = express.Router()

router.route("/").get(protect, getProducts)
router.route("/create").post(protect, createProduct)
router.route("/update/:id").put(protect, updateProduct)
router.route("/delete/:id").delete(protect, deleteProduct)

export default router