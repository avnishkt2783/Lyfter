import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/user/user.js";
import Auth from "../models/auth/auth.js";
import OTPVerification from "../models/OTPVerification/OTPVerification.js";
import sendMail from "../utils/sendMail.js";
import { cloudinary } from "../middleware/upload.js";

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
      {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNo: user.phoneNo,
        theme: user.theme,
        profileImg: user.profileImg,
        isVerified: user.isVerified,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRY || "1h" }
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
      fullName: user.fullName,
      email: user.email,
      phoneNo: user.phoneNo,
      theme: user.theme,
      profileImg: user.profileImg,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed. Try again." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({
      where: { userId },
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
    return res.status(400).json({ message: "Authorization header required" });
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

    res.status(200).json({ message: "Logout Successful. Token Deleted." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      fullName,
      phoneNo,
      dob,
      addressAddress,
      addressCity,
      addressState,
      addressPincode,
      addressCountry,
    } = req.body;

    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      fullName,
      phoneNo,
      dob,
      address: {
        address: addressAddress,
        city: addressCity,
        state: addressState,
        pincode: addressPincode,
        country: addressCountry,
      },
    };

    if (req.file && req.file.path && req.file.filename) {
      if (user.profileImgPublicId) {
        await cloudinary.uploader.destroy(user.profileImgPublicId);
      }

      updateData.profileImg = req.file.path; 
      updateData.profileImgPublicId = req.file.filename; 
    }

    const updatedUser = await User.update(updateData, {
      where: { userId },
      returning: true,
    });

    res.json(updatedUser[1][0]);
  } catch (err) {
    console.error("Update profile error:", err);
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

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await OTPVerification.destroy({
      where: { userId: user.userId },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await OTPVerification.create({
      userId: user.userId,
      email, 
      otp,
      expiresAt,
    });

    await sendMail(email, "Your Lyfter OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP generated successfully", otp }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await OTPVerification.findOne({
      where: {
        userId: user.userId,
        otp,
      },
      order: [["createdAt", "DESC"]], 
    });

    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await OTPVerification.destroy({ where: { userId: user.userId } });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendRegisterOTP = async (req, res) => {
  const { fullName, gender, email, phoneNo, password } = req.body;

  try {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail)
      return res.status(409).json({ message: "Email already registered!" });

    const existingPhone = await User.findOne({ where: { phoneNo } });
    if (existingPhone)
      return res
        .status(409)
        .json({ message: "Phone number already registered!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await OTPVerification.create({
      email,
      otp,
      expiresAt,
      payload: JSON.stringify({ fullName, gender, email, phoneNo, password }),
    });

    await sendMail(email, "Lyfter Registration OTP", `Your OTP is: ${otp}`);

    res
      .status(200)
      .json({
        message: "OTP sent to email. Please verify to complete registration.",
      });
  } catch (error) {
    console.error("Error in sendRegisterOTP:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
};

export const verifyRegisterOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTPVerification.findOne({ where: { email, otp } });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const userData = JSON.parse(otpRecord.payload);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
      fullName: userData.fullName,
      gender: userData.gender,
      email: userData.email,
      phoneNo: userData.phoneNo,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    await Auth.create({ userId: user.userId, token });

    await OTPVerification.destroy({ where: { email } });

    res.status(201).json({
      message: "User registered and logged in successfully!",
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Error in verifyRegisterOTP:", error);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

export const resendRegisterOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const otpRecord = await OTPVerification.findOne({
      where: { email },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(404).json({ message: "No pending OTP request found." });
    }

    const userData = JSON.parse(otpRecord.payload);

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTPVerification.create({
      email,
      otp: newOtp,
      expiresAt,
      payload: JSON.stringify(userData),
    });

    await sendMail(email, "Lyfter OTP Resend", `Your new OTP is: ${newOtp}`);

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("Error in resendRegisterOTP:", error);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};
