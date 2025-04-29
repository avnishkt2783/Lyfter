import bcrypt from 'bcrypt';

import User from "../models/user/user.js";

// Register User Controller
export const registerUser = async (req, res) => {

  const { fullName, gender, email, phoneNo, password} = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    const existingUserName = await User.findOne({ where: { fullName } });
    if (existingUserName) {
      return res.status(400).json({ message: "Name already registered!" });
    }

    const existingUserPhone = await User.findOne({ where: { phoneNo } });
    if (existingUserPhone) {
      return res.status(400).json({ message: "Phone Number already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      fullName,
      gender,
      email,
      phoneNo,
      password : hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully!", user });
  } catch (error) {
    // console.error(error);
    console.error('Error while registering user:', error);  // <--- More detailed error
    res.status(500).json({ message: "Registration failed. Try again." });
  }
};

// // Login User Controller (optional for now - you can improve later)
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ message: "User not found!" });
//     }

//     if (user.password !== password) {
//       return res.status(400).json({ message: "Incorrect password!" });
//     }

//     res.status(200).json({ message: "Login successful!", user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Login failed. Try again." });
//   }
// };
