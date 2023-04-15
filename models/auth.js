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

module.exports = mongoose.model("authSchema", authSchema)