import mongoose from "mongoose";
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_CONNECTION_URL)
        console.log(`MongoDB connected successfully ${conn.connection.host}`)
    } catch (err) {
        console.log(err.message);
        process.exit(1)
    }
}

module.exports = connectDB