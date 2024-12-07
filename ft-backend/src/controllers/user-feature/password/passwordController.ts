import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../../../prisma/client';

interface CustomRequest extends Request {
  user?: {
    id: number; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}

export const setOwnerPassword = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Access the userId from the request user object (decoded JWT)
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const { ownerPassword } = req.body;

    if (!ownerPassword) {
      return res.status(400).json({ message: 'Owner password is required' });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Create or update the owner password record for the user
    await prisma.ownerPassword.upsert({
      where: { userId },
      update: { password: hashedPassword },
      create: {
        userId,
        password: hashedPassword
      }
    });

    res.status(200).json({ message: 'Owner password set successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error setting owner password', error });
  }
};
