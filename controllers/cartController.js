import cart from "../models/cart.js";
import auth from "../models/auth.js";
import asyncHandler from "express-async-handler"

export const addProduct = asyncHandler(async(req,res) => {
    const { customer, productId, name, image, price, quantity } = req.body
    if(!customer || !productId || !name || !image || !price || !quantity){
        res.status(400)
        throw new Error("Please enter all required fields")
    }
    const user = auth.find(req.user.id)
    if(!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const cartItems = await cart.create({
        customer, productId, name, image, price, quantity
    })
    if(cartItems) {
        res.status(200).json({
            _id: cartItems.id,
            customer: cartItems.customer,
            productId: cartItems.productId,
            name: cartItems.name,
            price: cartItems.price,
            quantity: cartItems.quantity,
            image: cartItems.image
        })
    } else {
        res.status(400).json({error: "An error occurred when adding product to cart"})
    }
})

export const updateProduct = asyncHandler(async(req, res) => {
    const cartItem = await cart.findById(req.params.id)
    if(!cartItem) {
        res.status(404);
        throw new Error("Product does not exist");
    }
    const updatedProduct = await cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
})

export const getCart = asyncHandler(async(req,res) => {
    const cartItems = await cart.find({customer: decodeURIComponent(req.params.value)})
    if(!cartItems){
        res.status(400)
        throw new Error("There are no items in cart")
    }
    res.status(200).json(cartItems)
})
export const deleteProduct = asyncHandler( async(req,res) => {
    const cartItem = await cart.findById(req.params.id)
    if(!cartItem) {
        res.status(400).json("Product not found")
    }
    await cart.findByIdAndDelete(req.params.id)
    res.status(200).json({id: req.params.id, message: "Item deleted"})

} )

export default { addProduct, updateProduct,getCart, deleteProduct }