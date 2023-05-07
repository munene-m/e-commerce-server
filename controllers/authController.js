import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import authModel from "../models/auth.js"

//Register user
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)  {
    res.status(400);
    throw new Error("Please enter all the required fields");
  }
  const userExists = await authModel.findOne({ email });

  //check if user account exists in the database
  if (userExists) {
    res.status(400);
    throw new Error("User already exists!");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = await authModel.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201);
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

//Log in user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the required fields");
  } 

  const user = await authModel.findOne({ email });

  //if the entered password and the one hashed in the database match, sign it using the JWT secret key and send it as a cookie
  //in the response and return other user details entered in json format
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("The credentials you entered are invalid");
  }
});

//forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
 
});

// update user details
export const updateUser = asyncHandler( async( req, res ) => {
  const user = await authModel.findById(req.params.id);

  if(!user) {
      res.status(404);
      throw new Error("User does not exist");
  }else{
    const updatedUser = await authModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedUser);
  }

});

export const getCredentials = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export default {
  registerUser,
  loginUser,
  forgotPassword,
  updateUser,
  getCredentials
};
