import express from 'express'
import multer from 'multer'
import { protect } from '../middleware/authMiddleware.js'
import { createProduct, updateProduct, deleteProduct, getProducts } from '../controllers/productController.js'
const upload = multer({ dest: 'uploads/'})
const router = express.Router()

router.route("/").get(protect, getProducts)
router.route("/create").post(protect, upload.single('image'), createProduct)
router.route("/update/:id").put(protect, upload.single('image'), updateProduct)
router.route("/delete/:id").delete(protect, deleteProduct)

export default router