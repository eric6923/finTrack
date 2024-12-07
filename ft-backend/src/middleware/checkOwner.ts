import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/client';

interface CustomRequest extends Request {
  user?: {
    id: number; // User ID from the token
    role: string; // User role
  };
}

export const checkOwner = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body; // Get the password from the query string
    const userId = req.user?.id; // Get the user ID from the verified token

    // Validate required inputs
    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the token' });
      return;
    }

    // Fetch the owner password from the database
    const ownerPasswordRecord = await prisma.ownerPassword.findUnique({
      where: { userId },
    });

    if (!ownerPasswordRecord) {
      res.status(404).json({ message: 'Owner password not set for this user' });
      return;
    }

    // Compare the provided password with the stored hashed password
    const isValidPassword = await bcrypt.compare(password as string, ownerPasswordRecord.password);

    if (!isValidPassword) {
      res.status(403).json({ message: 'Invalid owner password' });
      return;
    }

    // If password is valid, proceed to the next middleware or route
    next();
  } catch (error) {
    console.error('Error in checkOwnerPassword middleware:', error);
    res.status(500).json({ message: 'Error checking password'});
  }
};
