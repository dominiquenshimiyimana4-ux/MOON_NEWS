import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User, { type IUser } from './models/User';
import { connectDB } from './config/database';
import { hashPassword } from './utils/password';

dotenv.config();

interface ProvisionedAccount {
  name: string;
  email: string;
  password: string;
  role: IUser['role'];
}

function accountFromEnvironment(
  nameKey: string,
  emailKey: string,
  passwordKey: string,
  role: IUser['role'],
  defaultName: string,
  defaultEmail: string
): ProvisionedAccount {
  const name = process.env[nameKey]?.trim() || defaultName;
  const email = (process.env[emailKey]?.trim() || defaultEmail).toLowerCase();
  const password = process.env[passwordKey] ?? '';

  if (!password || password.length < 8) {
    throw new Error(`${passwordKey} must be set to at least 8 characters.`);
  }

  return { name, email, password, role };
}

async function provisionAccount(account: ProvisionedAccount): Promise<void> {
  const password = await hashPassword(account.password);
  await User.findOneAndUpdate(
    { email: account.email },
    {
      $set: {
        name: account.name,
        email: account.email,
        password,
        role: account.role,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, runValidators: true }
  );
  console.log(`Provisioned ${account.role} account: ${account.email}`);
}

async function main(): Promise<void> {
  const accounts = [
    accountFromEnvironment(
      'ADMIN_NAME',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD',
      'admin',
      'Moon News Administrator',
      'nshimiyimanadominique4@gmail.com'
    ),
    accountFromEnvironment(
      'AUTHOR_NAME',
      'AUTHOR_EMAIL',
      'AUTHOR_PASSWORD',
      'journalist',
      'Moon News Author',
      'authormoonnews@gmail.com'
    ),
    accountFromEnvironment(
      'ADVERTISER_NAME',
      'ADVERTISER_EMAIL',
      'ADVERTISER_PASSWORD',
      'advertiser',
      'Moon News Advertiser',
      'advertisermoonnews@gmail.com'
    ),
  ];

  const emails = accounts.map(({ email }) => email);
  if (new Set(emails).size !== emails.length) {
    throw new Error('Admin, author, and advertiser accounts must use different e-mail addresses.');
  }

  await connectDB();
  for (const account of accounts) {
    await provisionAccount(account);
  }
}

main()
  .catch((error: unknown) => {
    console.error('Failed to provision authentication accounts:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
