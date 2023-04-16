import mongoose from "mongoose"

const authSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },

}, {timeStamps: true})

export default mongoose.model("users", authSchema)