// utils/ensureAdmin.js
import User from "../models/user/user.js";
import bcrypt from "bcrypt";

const ensureAdmin = async () => {
  const env_adminEmail = `${process.env.ADMIN_EMAIL}`;
  const env_adminPass = `${process.env.ADMIN_PASSWORD}`;
  const env_adminName = `${process.env.ADMIN_NAME}`;
  const env_adminGender = `${process.env.ADMIN_GEN}`;
  const env_adminPhoneNo = `${process.env.ADMIN_PHONENO}`;
  const env_adminRole = `${process.env.ADMIN_ROLE}`;
  try {
    const existing = await User.findOne({ where: { email: env_adminEmail } });

    if (existing) {
      console.log("⚠️ Admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(env_adminPass, 10);

    await User.create({
      fullName: env_adminName,
      gender: env_adminGender,
      email: env_adminEmail,
      phoneNo: env_adminPhoneNo,
      password: hashedPassword,
      role: env_adminRole,
    });

    console.log("✅ Admin user created successfully.");
  } catch (error) {
    console.error("❌ Error ensuring admin user exists:", error);
  }
};

export default ensureAdmin;
