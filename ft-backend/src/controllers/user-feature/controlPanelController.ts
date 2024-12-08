import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../../prisma/client';

interface CustomRequest extends Request {
  user?: {
    id: number; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}

export const verifyControlPanelPassword = async (req: CustomRequest, res: Response) => {
  try {
    const { password } = req.body; // Password provided by the user
    const userId = req.user?.id; // User ID from the verified token

    // Validate required inputs
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in the token.' });
    }

    // Fetch the hashed owner password from the database
    const ownerPasswordRecord = await prisma.ownerPassword.findUnique({
      where: { userId },
    });

    if (!ownerPasswordRecord) {
      return res.status(404).json({ message: 'Owner password not set for this user.' });
    }

    // Compare the provided password with the stored hashed password
    const isValidPassword = await bcrypt.compare(password, ownerPasswordRecord.password);

    if (!isValidPassword) {
      return res.status(403).json({ message: 'Invalid password.' });
    }

    // If the password is valid, return success
    res.status(200).json({ message: 'Password verified successfully.' });
  } catch (error) {
    console.error('Error verifying control panel password:', error);
    res.status(500).json({ message: 'Error verifying password.'});
  }
};
