import { v2 as cloudinary } from 'cloudinary'
import asyncHandler from "express-async-handler"
import products from "../models/products.js"
import multer from 'multer';


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
    cloud_name: "doj335om4",
    api_key: 522876894532472,
    api_secret: "pZQf_dO0emYz0n5nzjdw38lpk4M"
})

//Create product
export const createProduct = asyncHandler( async(req, res) =>{
    const { name, description, price, quantity } = req.body
    const image = req.file
    const result = await cloudinary.uploader.upload(image.path, {
        width: 500,
        height: 500,
        crop: 'fill'
    })

    const product = await products.create({
        name, description, price, quantity,  
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
            image: product.image
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
    }
    const updatedProduct = await products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
})

export const getProducts = asyncHandler( async(req, res) =>{
    const products = await products.find()
    if (!products) {
        res.status(400)
        throw new Error("There are no products in your store")
    } else {
        res.status(200).json(products)
    }
} )

export const deleteProduct = asyncHandler(async(req, res) => {
    const product = await products.findById(req.params.id);
    if(!product) {
        res.status(404);
        throw new Error("Product not found ");
    }
    await service.remove();
    res.status(200).json({ id: req.params.id })
})

export default { createProduct, updateProduct, deleteProduct, getProducts }