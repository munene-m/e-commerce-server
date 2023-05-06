import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    }
})

export default mongoose.model("payments", paymentSchema)