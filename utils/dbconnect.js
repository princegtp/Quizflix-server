import mongoose from 'mongoose';

const connectDb = async () => {
  // Check if the connection already exists
  if (mongoose.connections[0].readyState) {
    return; // If there's already a connection, don't reconnect
  }

  try {
    // Establish a new connection if none exists
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

export default  connectDb
