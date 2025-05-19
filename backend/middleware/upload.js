// middleware/upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_images",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  },
});

const upload = multer({ storage });

export { upload, cloudinary };
