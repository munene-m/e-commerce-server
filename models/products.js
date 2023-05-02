import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description: {
        type:String,
        required: true 
    },
    price: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String
    },
    imagePublicID: {
        type: String
    }
})

export default mongoose.model("products", productSchema)
