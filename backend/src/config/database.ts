
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI is missing. Set it in Render Environment.'
      );
    }

    if (
      !mongoUri.startsWith('mongodb://') &&
      !mongoUri.startsWith('mongodb+srv://')
    ) {
      throw new Error(
        'MONGODB_URI must start with mongodb:// or mongodb+srv://'
      );
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default mongoose;
