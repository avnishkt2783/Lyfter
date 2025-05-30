import jwt, { decode } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const whitelist = [
  "/api/login",
  "/api/logout",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/register/request",
  "/api/register/verify",
  "/api/register/resend",
];

const authenticate = (req, res, next) => {
  try {
    if (whitelist.some((path) => req.path.startsWith(path))) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).send("Token Required");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { id: decoded.userId, ...decoded };

    next();
  } catch (err) {
    if (err) return res.status(401).send("Token Expired");
  }
};

export default authenticate;
