import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import authModel from "../models/auth.js"
import sgMail from '@sendgrid/mail'

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

export const resetPassword = async(req, res) => {
  const {email} = req.body

  sgMail.setApiKey(process.env.SENDGRID_APIKEY);

  if (!email) {
    res.status(400).json({ error: 'Please provide an email address' });
    return;
  }
  try {
    const user = await authModel.findOne({ email });

    if (!user) throw new Error("User does not exist");


    const userId = user.id; // Get the user's ID

    const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generate the reset token

    const resetLink = `https://e-commerce-munene-m/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: 'macmunene364@gmail.com',
      subject: 'Reset Your Password',
      text: `Click the following link to reset your password: ${resetLink}`,
    };
    sgMail
    .send(msg)
    .then(() => {
      res.status(200).json({ message: 'Reset password email sent' });
    })
    .catch((error) => {
      console.error('Error sending reset password email:', error);
      res.status(500).json({ error: 'Failed to send reset password email' });
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
}

export const updatePassword = async (req, res) => {
  const { token, newPassword } = req.body; //in the client side, extract token from the reset link url and send it in a hidden input where you set value=<TOKEN>

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Extract the user ID from the decoded token
    const userId = decodedToken.userId;

    // Find the user in the database by their ID
    const user = await authModel.findOne({ _id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user in the database
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: 'Failed to update password' });
  }
};



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
  updatePassword,
  getCredentials, resetPassword
};
