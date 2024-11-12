import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    correctOption: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",  // Referencing the Exam model
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is registered only once (use `mongoose.models` for this)
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

export default Question;
