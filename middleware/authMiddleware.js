import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import authModel from "../models/auth.js"
export const protect = asyncHandler( async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await authModel.findById(decoded.id).select('-password')

        next()
    } else {
        res.status(401)
        throw new Error("Unauthorized attempt")
    }
    if(!token){
        res.status(401)
        throw new Error("No authorization without token")
    }

})
export default {protect}