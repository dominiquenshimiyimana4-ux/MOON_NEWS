
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is missing. Set it in Render Environment.'
    );
  }

  let parsedUri: URL;

  try {
    parsedUri = new URL(mongoUri);
  } catch {
    throw new Error(
      'MONGODB_URI is not a valid URL. Copy the complete URI from MongoDB Atlas.'
    );
  }

  if (
    parsedUri.protocol !== 'mongodb:' &&
    parsedUri.protocol !== 'mongodb+srv:'
  ) {
    throw new Error(
      'MONGODB_URI must start with mongodb:// or mongodb+srv://'
    );
  }

  if (!parsedUri.hostname || !parsedUri.hostname.includes('.')) {
    throw new Error(
      'MongoDB hostname is missing or incomplete. Copy the URI from Atlas.'
    );
  }

  if (
    mongoUri.includes('<db_password>') ||
    mongoUri.includes('YOUR_REAL_CLUSTER_HOST')
  ) {
    throw new Error(
      'MONGODB_URI still contains a placeholder. Replace it with your actual Atlas values.'
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error(
      'MongoDB connection failed. Check Atlas credentials, hostname, and Network Access.',
      error instanceof Error ? error.message : 'Unknown connection error'
    );

    throw error;
  }
};

export default mongoose;
