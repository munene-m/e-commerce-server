import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import authModel from "../models/auth.js"
import Token from "../models/token.js"
import { google } from 'googleapis';
// import Handlebars from "handlebars";
import nodemailer from 'nodemailer'
import fs from "fs"
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from "crypto"
const bcryptSalt = process.env.BCRYPT_SALT


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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

  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate a token for the user
    const token = generateToken(user._id);

    // Create a session for the user
    const sessionId = req.session.id;


    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token, sessionId
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
    // Generate a token for the user
    const token = generateToken(user._id);

    // Create a session for the user
    const sessionId = req.session.id;

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token, sessionId
    });
  }else {
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

export async function googleAuthCallback(req, res) {
  const { code, state } = req.query;
  const { email, resetLink } = JSON.parse(state);

  try {
    // Exchange the authorization code for an access token
    const oauthClient = new google.auth.OAuth2(
      process.env.OAUTH_CLIENTID,
      process.env.OAUTH_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );

    const { tokens } = await oauthClient.getToken(code);

    // Store the tokens in the user's details in the database
    const user = await authModel.findOneAndUpdate(
      { email },
      { googleTokens: tokens }
    );

    // Send the password reset email using the stored tokens
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user.email,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        expires: tokens.expiry_date,
      },
    });

    const mailOptions = {
      from: "munenenjue18@gmail.com",
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Dear ${user.username},</p><p>Please click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send password reset email' });
      } else {
        return res.status(200).json({ message: 'Password reset email sent' });
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to handle Google OAuth callback' });
  }
}


export async function resetPassword (req, res){
  const { email } = req.body;

  // let testAccount = await nodemailer.createTestAccount()
  // Validate the email address
  if (!email) {
    res.status(400).json({ error: 'Please provide an email address' });
    return;
  }
  try {
    const user = await authModel.findOne({ email });

    if (!user) throw new Error("User does not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    // Send the password reset email to the user
  const resetLink = `https://e-commerce-munene-m/reset-password?token=${resetToken}`;

  
    // Initialize the OAuth client
    const oauthClient = new google.auth.OAuth2(
      process.env.OAUTH_CLIENTID,
      process.env.OAUTH_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );

    // Generate the OAuth URL
    const authUrl = oauthClient.generateAuthUrl({
      scope: 'https://www.googleapis.com/auth/gmail.send', // Add any additional scopes required
      state: JSON.stringify({ email, resetLink }), // Pass additional data to the callback
    });

    // Redirect the user to the Google OAuth consent screen
    res.redirect(authUrl);

  // const clientId = process.env.OAUTH_CLIENTID
  // const clientSecret = process.env.OUATH_CLIENT_SECRET
  
  // const transporter = nodemailer.createTransport({
  //   host: "sandbox.smtp.mailtrap.io", //will replace with Gmail
  //   port: 2525,//Replace with secure smtp port
  //   secure: false,
  //   auth: {
  //     user: "dba510b50cf003",
  //     pass: "5af649268a7a2d",
  //   },
  //   debug:true
  // });

  // const source = fs.readFileSync(path.join(__dirname, '../utils/templates/requestResetPassword.handlebars'), "utf8");
  // const compiledTemplate = Handlebars.compile(source);

  // const mailOptions = () => {
  //   return {
  //     from: "smtp.ethereal.email",
  //     to: user.email,
  //     subject: 'Password Reset',
  //     html: compiledTemplate({resetLink, username: user.username})
  //     // text: `Dear ${user.username},\n\nPlease click the following link to reset your password: ${resetLink}`,
  //   }
  // };

  // transporter.sendMail(mailOptions(), (error,info) => {
  //   if(error){
  //     console.log(error);
  //     return res.status(500).json({ error: 'Failed to send password reset email' });
  //   } else {
  //     return res.status(200).json({ message: 'Password reset email sent' });
  //   }
  // });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
}

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
  getCredentials, googleAuthCallback, resetPassword
};
