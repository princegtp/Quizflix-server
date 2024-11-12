import authMiddleware from '../../middlewares/authMiddleware.js';
import connectDb from '../../utils/dbconnect.js';
import Question from '../../models/questionModel.js';
import Exam from '../../models/examModel.js';

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

  if (req.method === 'POST') {
    await authMiddleware(req, res); // Authenticate the request

    await connectDb();

    try {
      const { type, examId, questionId } = req.body;

      if (type === 'deleteQuestion') {
        // Handle Question Deletion
        if (!questionId || !examId) {
          return res.status(400).json({ message: "Missing required fields (questionId, examId)", success: false });
        }

        // Delete the question
        await Question.findByIdAndDelete(questionId);

        const exam = await Exam.findById(examId);
        if (!exam) {
          return res.status(404).json({ message: "Quiz not found", success: false });
        }

        // Remove question from the exam's question list
        exam.questions = exam.questions.filter((question) => question._id != questionId);
        await exam.save();

        return res.status(200).json({
          message: "Question deleted successfully",
          success: true,
        });
      } 
      
      else if (type === 'deleteExam') {
        // Handle Exam Deletion
        if (!examId) {
          return res.status(400).json({ message: "Missing required field (examId)", success: false });
        }

        // Delete the exam
        await Exam.findByIdAndDelete(examId);

        return res.status(200).json({
          message: "Quiz deleted successfully",
          success: true,
        });
      } 
      
      else {
        return res.status(400).json({
          message: "Invalid 'type' parameter. Expected 'deleteQuestion' or 'deleteExam'.",
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
