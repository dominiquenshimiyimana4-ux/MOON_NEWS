import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

/**
 * Roles a visitor may pick when signing up. Only reader accounts can be
 * self-registered; advertiser, author and admin accounts are provisioned and
 * sign in through the browser.
 */
const PUBLIC_REGISTER_ROLES = ['reader'];

/**
 * Provisioned accounts (admin, author, advertiser) are created by the seed
 * script, never through the public register endpoint. Their e-mails are
 * reserved so nobody can sign up with them and shadow the real account.
 */
const RESERVED_ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL ?? 'nshimiyimanadominique4@gmail.com',
  process.env.AUTHOR_EMAIL ?? 'authormoonnews@gmail.com',
  process.env.ADVERTISER_EMAIL ?? 'advertisermoonnews@gmail.com',
].map((email) => email.trim().toLowerCase());

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    createdAt: string;
  };
}

export const authController = {
  login: async (req: AuthRequest, res: Response) => {
    try {
      const { email, password }: LoginRequest = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const response: AuthResponse = {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  register: async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, role }: RegisterRequest = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Never let the public register form claim a staff/administrator address.
      if (RESERVED_ADMIN_EMAILS.includes(normalizedEmail)) {
        return res.status(403).json({ error: 'This e-mail address cannot be registered.' });
      }

      const requestedRole = role && PUBLIC_REGISTER_ROLES.includes(role) ? role : 'reader';

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Passwords are stored as bcrypt hashes only — never in plain text.
      const hashedPassword = await hashPassword(password);
      const newUser = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: requestedRole,
      });

      await newUser.save();

      const token = generateToken({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      const response: AuthResponse = {
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          role: newUser.role,
          createdAt: newUser.createdAt.toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  logout: async (req: AuthRequest, res: Response) => {
    // JWT is stateless, logout is handled on frontend by removing token
    res.json({ message: 'Logged out successfully' });
  },
};
