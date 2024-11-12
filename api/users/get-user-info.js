import connectDb from "../../utils/dbconnect.js";
import userModel from "../../models/userModel.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js"; // Import the middleware

export default async function handler(req, res) {
  // CORS setup
  const allowedOrigin = process.env.ALLOW_ORIGIN;
  
  // Set CORS headers
  console.log(req.headers.origin);
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
      // Connect to the database
      await connectDb();

      // Apply the authMiddleware to verify the token
      await authMiddleware(req, res); // Call the authMiddleware to verify token

      // Now the userId is set in req.userId by the middleware, so we can use it
      const  userID  = req.userId

    
      // Check if the userId from the request body matches the verified userId
      if (!userID) {
        return res.status(403).json({ message: "Forbidden", success: false });
      }

      // Fetch the user from the database
      const user = await userModel.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      // Return the user info
      return res.status(200).json({
        message: "User info fetched successfully",
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Something went wrong",
        success: false,
      });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
