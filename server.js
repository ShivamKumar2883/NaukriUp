// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import multer from "multer";
// import cloudinary from "cloudinary";
// import fs from "fs";

// dotenv.config();

// // Debug: Check if JWT_SECRET is loaded
// console.log("JWT_SECRET:", process.env.JWT_SECRET);

// const app = express();
// const upload = multer({ dest: "uploads/" });

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// // Cloudinary configuration
// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Gemini API setup
// const API_KEY = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// // Mock user database (replace with a real database like MongoDB)
// const users = [];

// // Helper function to generate JWT token
// const generateToken = (userId, role) => {
//   return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
// };

// // Middleware to verify JWT
// const authenticateUser = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// // Route to handle user login
// app.post("/api/v1/user/login", async (req, res) => {
//   const { email, password, role } = req.body;

//   // Find user in the database
//   const user = users.find((u) => u.email === email && u.role === role);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Compare passwords
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     return res.status(401).json({ message: "Invalid password" });
//   }

//   // Generate JWT token
//   const token = generateToken(user.id, user.role);

//   // Set token in cookies
//   res.cookie("token", token, { httpOnly: true, secure: false });
//   res.json({ message: "Login successful", user });
// });

// // Route to handle user registration
// app.post("/api/v1/user/register", async (req, res) => {
//   const { name, email, password, role, phone } = req.body;

//   // Check if user already exists
//   const userExists = users.some((u) => u.email === email && u.role === role);
//   if (userExists) {
//     return res.status(400).json({ message: "User already exists" });
//   }

//   // Hash password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Create new user
//   const newUser = {
//     id: users.length + 1,
//     name,
//     email,
//     password: hashedPassword,
//     role,
//     phone,
//   };
//   users.push(newUser);

//   // Generate JWT token
//   const token = generateToken(newUser.id, newUser.role);

//   // Set token in cookies
//   res.cookie("token", token, { httpOnly: true, secure: false });
//   res.json({ message: "Registration successful", user: newUser });
// });

// // Route to fetch user data
// app.get("/api/v1/user/getuser", authenticateUser, (req, res) => {
//   const user = users.find((u) => u.id === req.user.userId);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   res.json({ user });
// });

// // Route to handle image upload and analysis
// app.post("/analyze", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded" });
//     }

//     const imagePath = req.file.path;
//     const prompt = "Describe the content of this image in detail.";

//     // Load the image
//     const image = {
//       inlineData: {
//         data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
//         mimeType: req.file.mimetype,
//       },
//     };

//     console.log("Sending request to Gemini API...");
//     const result = await model.generateContent([prompt, image]);
//     const analysis = result.response.text();

//     // Upload the image to Cloudinary
//     const cloudinaryResponse = await cloudinary.v2.uploader.upload(imagePath, {
//       folder: "ai-image-analyzer",
//     });

//     // Clean up the temporary file
//     fs.unlinkSync(imagePath);

//     res.json({
//       analysis,
//       imageUrl: cloudinaryResponse.secure_url,
//     });
//   } catch (error) {
//     console.error("Error analyzing image:", error);
//     res.status(500).json({ error: "Failed to analyze image" });
//   }
// });

// // Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


import app from "./app.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});