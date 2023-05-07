import { v2 as cloudinary } from 'cloudinary'
import asyncHandler from "express-async-handler"
import products from "../models/products.js"
import multer from 'multer';
import dotenv from 'dotenv'
dotenv.config()


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage });

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//Create product
export const createProduct = asyncHandler( async(req, res) =>{
    const { name, description, price, quantity, itemsInStock, category } = req.body
    const image = req.file
    const result = await cloudinary.uploader.upload(image.path, {
        width: 500,
        height: 500,
        crop: 'scale',
        quality:50
    })

    const product = await products.create({
        name, description, price, quantity, itemsInStock, category, 
        image: result.secure_url, // Save the Cloudinary URL to the product document
        imagePublicId: result.public_id // Save the public ID to the product document
    })
    if(product){
        res.status(201).json({
            _id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            itemsInStock: product.itemsInStock,
            category: product.category,
            image: product.image,
            imagePublicId: product.imagePublicId
        })
    } else {
        res.status(400).json({error: "An error occurred when creating the product"})
    }
} )

export const updateProduct = asyncHandler(async (req,res) =>{
    const product = await products.findById(req.params.id)

    if(!product){
        res.status(400)
        throw new Error("The product you tried to update does not exist")
      }else{
        const { name, description, quantity, itemsInStock, price, category } = req.body
        let image = product.image
        let imagePublicId = product.imagePublicId
        if (req.file) {
          // If a new image is uploaded, update it in Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            width: 500,
            height: 500,
            crop: "scale",
            quality: 60
          });
          image = result.secure_url
          imagePublicId = result.public_id
        }
        const updatedProduct = await products.findByIdAndUpdate(req.params.id,
          { name, description, quantity, itemsInStock, price, category, image, imagePublicId },
          { new: true }
        )
        res.status(200).json(updatedProduct);
      }

})

export const getProduct = asyncHandler(async (req, res) => {
    const product = await products.findById(req.params.id)
    if(!product){
        res.status(400)
        throw new Error("This product does not exist")
    } else {
        res.status(200).json(product)
    }
})

export const getProducts = asyncHandler( async(req, res) =>{
    const product = await products.find()
    if (!product) {
        res.status(400)
        throw new Error("There are no products in your store")
    } else {
        res.status(200).json(product)
    }
} )

export const getProductInCategory = asyncHandler(async (req, res) => {
    const product = await products.find({category: decodeURIComponent(req.params.value)})
    if(product.length === 0) {
        res.status(400)
        throw new Error("Product not found")
    } else {
        res.status(200).json(product)
    }
})

export const deleteProduct = asyncHandler(async(req, res) => {
    const product = await products.findById(req.params.id);
    if(!product) {
        res.status(404);
        throw new Error("Product not found ");
    }else{
        await products.findByIdAndDelete(req.params.id);
        res.status(200).json({ id: req.params.id, message: "Item deleted" })
    }

})

export default { createProduct, updateProduct, deleteProduct, getProducts,  getProduct}