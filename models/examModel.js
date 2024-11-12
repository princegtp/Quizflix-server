import mongoose from "mongoose";

// Define the exam schema
const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    // Array of ObjectIds referencing Question models
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"  // Ensure this references the Question model correctly
    }],
    
  },
  {
    timestamps: true,
  }
);

// Register the model
const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;
