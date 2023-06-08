import express from 'express'
import multer from 'multer'
import { protect } from '../middleware/authMiddleware.js'
import { createProduct, updateProduct, deleteProduct, getProduct, getProducts, getProductInCategory } from '../controllers/productController.js'
const upload = multer({ dest: 'uploads/'})
const router = express.Router()

router.route("/").get(getProducts)
router.route("/create").post(protect, upload.single('image'), createProduct)
router.route("/update/:id").put(protect, upload.single('image'), updateProduct)
router.route("/product/:id").get(getProduct)
router.route("/item/:value").get(getProductInCategory)
router.route("/delete/:id").delete(protect, deleteProduct)

export default router