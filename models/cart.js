import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    customer: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    }, 
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
}, { timestamps: true })

export default mongoose.model("cart", cartSchema)

