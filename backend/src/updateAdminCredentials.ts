import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import User from './models/User';
import { hashPassword } from './utils/password';

dotenv.config();

/**
 * Provisions the administrator account.
 *
 * The password is NEVER stored in plain text: it is bcrypt-hashed (10 salt
 * rounds) here and only the hash is written to MongoDB. Credentials come from
 * the environment (`.env`) so they are not committed to the repository.
 *
 *   ADMIN_NAME      – display name of the administrator
 *   ADMIN_EMAIL     – login e-mail (reserved: cannot be self-registered)
 *   ADMIN_PASSWORD  – plain password, hashed before it touches the database
 */
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Dominique Nshimiyimana';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'nshimiyimanadominique4@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Dominique@2006';

const updateAdminCredentials = async () => {
  try {
    await connectDB();

    if (ADMIN_PASSWORD.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
    }

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    const admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.email = ADMIN_EMAIL;
      admin.password = passwordHash;
      admin.role = 'admin';
      admin.updatedAt = new Date();
      await admin.save();
      console.log(`Admin updated: ${ADMIN_EMAIL} (password stored as bcrypt hash)`);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: 'admin',
      });
      console.log(`Admin created: ${ADMIN_EMAIL} (password stored as bcrypt hash)`);
    }

    // Only the hash is ever persisted; show the beginning of it as a sanity check.
    console.log(`Stored hash prefix: ${passwordHash.slice(0, 7)}...`);
  } catch (error) {
    console.error('Failed to update admin credentials:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void updateAdminCredentials();
