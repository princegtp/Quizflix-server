import authMiddleware from '../../middlewares/authMiddleware.js';
import connectDb from '../../utils/dbconnect.js';
import Question from '../../models/questionModel.js';

export default async function handler(req, res) {
    // CORS setup
const allowedOrigin = process.env.ALLOW_ORIGIN;
// Set CORS headers
console.log(req.headers.origin)
if (req.headers.origin === allowedOrigin) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
} else {
  return res.status(403).json({ message: "Forbidden" });
}
 res.setHeader("Access-Control-Allow-Methods", " POST, OPTIONS");
 res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
 res.setHeader("Access-Control-Allow-Credentials", "true");
 // Handle preflight requests
 if (req.method === "OPTIONS") {
   return res.status(200).end(); // Respond to preflight request
 }

  if (req.method === 'POST') {
   await authMiddleware(req, res);
  

    await connectDb();

    try {
      await Question.findByIdAndUpdate(req.body.questionId, req.body);
      res.status(200).json({
        message: "Question edited successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        data: error,
        success: false,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
