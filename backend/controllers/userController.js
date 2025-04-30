import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import User from "../models/user/user.js";
import Auth from "../models/auth/auth.js";

export const registerUser = async (req, res) => {

  const { fullName, gender, email, phoneNo, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered!" });
    }

    const existingUserPhone = await User.findOne({ where: { phoneNo } });
    if (existingUserPhone) {
      return res.status(409).json({ message: "Phone Number already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      gender,
      email,
      phoneNo,
      password : hashedPassword,
    });

    const token = jwt.sign(
      {userId: user.userId, fullName: user.fullName, email: user.email, phoneNo: user.phoneNo},
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h"}
    );

    await Auth.create({
      userId: user.userId,
      token: token,
    });

    res.status(201).json({ 
      message: "User registered successfully!", 
      userId: user.userId,
      fullName: user.fullName ,
      email: user.email,
      phoneNo: user.phoneNo,
      token
    });
  } 
  catch (error) {
    console.error('Error while registering user:', error);  
    res.status(500).json({ message: "Registration failed. Try again." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = jwt.sign(
      {userId: user.userId, fullName: user.fullName, email: user.email, phoneNo: user.phoneNo},
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h"}
    );

    await Auth.create({
      userId: user.userId,
      token: token,
    });

    user.isLoggedIn = true;
    await user.save();

    res.status(201).json({ 
      message: "Logged in successfully!", 
      userId: user.userId,
      fullName: user.fullName ,
      email: user.email,
      phoneNo: user.phoneNo,
      token
    });

  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed. Try again." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({
      where: { userId },
      attributes: ["userId", "fullName", "email", "phoneNo", "age", "address"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  const { email } = req.params;


  if(!email) {
    return res.status(400).json({ message: 'Email is required'})
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Server error during logout!" });
    }

    // await Auth.destroy({
    //   where: { email: user.email }
    // });

     // Delete the Auth token using userId instead of email
     await Auth.destroy({
      where: { userId: user.userId }
    });

    user.isLoggedIn = false;
    await user.save();

    res.status(200).json({ message: 'Logout Successful. Token Deleted.'});

  } 
  catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error during logout.' })  
  }
};
