import connectDb from '../../utils/dbconnect.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import Report from '../../models/reportModel.js';
import Exam from '../../models/examModel.js'; // Ensure the Exam model is imported
import User from '../../models/userModel.js'; // Ensure the User model is imported

export default async function handler(req, res) {
  // CORS setup
  const allowedOrigin = process.env.ALLOW_ORIGIN;

  if (req.headers.origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.setHeader("Access-Control-Allow-Methods", " POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respond to preflight request
  }

  if (req.method === 'POST') {
    // Call authentication middleware
    await authMiddleware(req, res);

    // Connect to the database
    await connectDb();

    try {
      // Find reports by userId
      const reports = await Report.find({ user: req.userId }) // Using req.userId to filter by the logged-in user
        .sort({ createdAt: -1 });

      // If no reports found for the user
      if (!reports.length) {
        return res.status(404).json({ message: "No reports found for this user", success: false });
      }

      // After finding reports, populate `exam` and `user`
      const populatedReports = await Report.populate(reports, [
        { path: 'exam', model: Exam },  // Populate the `exam` field
        { path: 'user', model: User }   // Populate the `user` field (optional since you're already filtering by `userId`)
      ]);

      // Send populated reports in the response
      res.status(200).json({
        message: "Attempts fetched successfully",
        data: populatedReports,
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
    res.status(405).json({
      message: "Method Not Allowed",
      success: false,
    });
  }
}
