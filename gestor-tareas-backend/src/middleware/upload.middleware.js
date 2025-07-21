// src/middleware/upload.middleware.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gestor-tareas",
    allowed_formats: ["jpg", "png", "pdf", "doc", "docx", "xlsx"],
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

export default upload;
