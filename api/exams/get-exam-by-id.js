import connectDb from '../../utils/dbconnect.js';
import Question from '../../models/questionModel.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import Exam from '../../models/examModel.js';

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
  
  console.log(req.body.examId);
  await connectDb();
  
  try {
    // Fetch the exam first
    const exam = await Exam.findById(req.body.examId);
    
    // If exam is found, manually populate the `questions` field
    if (exam) {
      const questions = await Question.find({
        _id: { $in: exam.questions }
      });

      // Add the questions to the exam object manually
      exam.questions = questions;

      console.log(exam, 'exam');
      res.status(200).json({
        message: 'Quiz fetched successfully',
        data: exam,
        success: true,
      });
    } else {
      res.status(404).json({ message: 'Quiz not found', success: false });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: error,
      success: false,
    });
  }
} else {
  res.status(405).json({ message: 'Method Not Allowed' });
}
}
