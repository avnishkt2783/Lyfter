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

    user.isLoggedIn = true;
    await user.save();

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
      {userId: user.userId, fullName: user.fullName, email: user.email, phoneNo: user.phoneNo, theme: user.theme},
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h"}
    );

    await Auth.create({
      userId: user.userId,
      token: token,
    });

    user.isLoggedIn = true;
    await user.save();

    res.status(200).json({ 
      message: "Logged in successfully!", 
      userId: user.userId,
      fullName: user.fullName ,
      email: user.email,
      phoneNo: user.phoneNo,
      theme: user.theme,
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
      where: { userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let age = null;
    if (user.dob) {
      const birthDate = new Date(user.dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    res.json({ ...user.toJSON(), age });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: 'Authorization header required' });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await Auth.destroy({ where: { token } });

    user.isLoggedIn = false;
    await user.save();

    res.status(200).json({ message: 'Logout Successful. Token Deleted.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      fullName,
      phoneNo,
      dob, // Received from frontend
      addressAddress,
      addressCity,
      addressState,
      addressPincode,
      addressCountry,
    } = req.body;

    const currentDob = user.dob ? new Date(user.dob) : null; 

    if (currentDob && dob && currentDob.toISOString().split("T")[0] !== dob) {
      return res.status(400).json({ message: "DOB is already set and cannot be changed" });
    }

    const profileImgPath = req.file ? `/uploads/${req.file.filename}` : user.profileImg;

    const updatedAddress = {
      address: addressAddress,
      city: addressCity,
      state: addressState,
      pincode: addressPincode,
      country: addressCountry,
    };

    const updatedDob = currentDob || (dob ? new Date(dob) : null); 

    await user.update({
      fullName,
      phoneNo,
      dob: updatedDob,
      profileImg: profileImgPath,
      address: updatedAddress,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      profileImageUrl: profileImgPath,
      fullName: user.fullName,
      email: user.email,
      phoneNo: user.phoneNo,
      dob: updatedDob,
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const updateTheme = async (req, res) => {
  const userId = req.user.userId; 
  const { theme } = req.body;

  if (!theme) {
    return res.status(400).json({ message: "Theme is required" });
  }

  try {
    const updatedUser = await User.update({ theme }, { where: { userId } });

    if (updatedUser[0] === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Theme updated successfully" });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ message: "Failed to update theme" });
  }
};
