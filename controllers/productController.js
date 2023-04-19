import asyncHandler from "express-async-handler"
import products from "../models/products"

//Create product
export const createProduct = asyncHandler( async(req, res) =>{
    const { name, description, price, image } = req.body
    if(!name || !description || !price || !image) {
        res.status(400)
        throw new Error("Please enter all required fields")
    }
    const product = await products.create({
        name, description, price, image
    })
    if(product){
        res.status(201).json({
            _id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
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