import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import User from './models/User';
import { hashPassword } from './utils/password';

dotenv.config();

const updateAdminCredentials = async () => {
  try {
    await connectDB();

    const password = await hashPassword('kajipo123');
    const admin = await User.findOne({
      $or: [{ email: 'admin@moonnews.rw' }, { email: 'kajipo tefu', role: 'admin' }],
    });

    if (admin) {
      admin.name = 'kajipo tefu';
      admin.email = 'kajipo tefu';
      admin.password =password;
      admin.role = 'admin';
      await admin.save();
    } else {
      await User.create({
        name: 'kajipo tefu',
        email: 'kajipo tefu',
        password,   role: 'admin',
      });
    }

    console.log('Admin credentials updated: kajipo tefu / kajipo123');
  } catch (error) {
    console.error('Failed to update admin credentials:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void updateAdminCredentials();
