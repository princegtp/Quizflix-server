import connectDb from "../../utils/dbconnect.js";
import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const config = {
  bodyParser: true,  // Enable body parser as we need to handle JSON
  api: {},
};

export default async function handler(req, res) {
  // CORS setup
  const allowedOrigin = process.env.ALLOW_ORIGIN;
  if (req.headers.origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respond to preflight request
  }

  if (req.method === "POST") {
    try {
      await connectDb();
      const { type, email, password, ...otherData } = req.body;

      if (!type || !email || !password) {
        return res.status(400).json({
          message: "Missing required fields (type, email, password)",
          success: false,
        });
      }

      if (type === "register") {
        // Handle Registration
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(200).json({ message: "User already exists", success: false });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ email, password: hashedPassword, ...otherData });
        await newUser.save();

        return res.status(201).json({
          message: "User created successfully",
          success: true,
        });
      } else if (type === "login") {
        // Handle Login
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(200).json({ message: "User does not exist", success: false });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(200).json({ message: "Invalid password", success: false });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
          message: "User logged in successfully",
          success: true,
          data: token,
        });
      } else {
        return res.status(400).json({
          message: "Invalid 'type' parameter. Expected 'register' or 'login'.",
          success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
