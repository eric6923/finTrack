import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from '../../../prisma/client';

interface CustomRequest extends Request {
    user?: {
      id: string; // User ID from the token
      role: string; // User role, e.g., "user" or "admin"
    };
  }
  

  export const checkOnboard = async (req: CustomRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
  
      // Fetch the user by ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          ownerPassword: true,
          companyShareDetails: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Check if required fields are filled
      const isBoxBalanceFilled = user.boxBalance.toNumber() > 0; // Convert Decimal to number
      const isAccountBalanceFilled = user.accountBalance.toNumber() > 0; // Convert Decimal to number
      const isCompanyShareDetailsFilled = !!user.companyShareDetails; // Checks if not null
      const isOwnerPasswordFilled = !!user.ownerPassword; // Checks if not null
  
      // Determine if all fields are filled
      const allFieldsFilled =
        isBoxBalanceFilled &&
        isAccountBalanceFilled &&
        isCompanyShareDetailsFilled &&
        isOwnerPasswordFilled;
  
      // Response
      return res.status(200).json({
        message: allFieldsFilled
          ? "All required fields are filled."
          : "Some required fields are missing.",
        details: {
          boxBalance: isBoxBalanceFilled,
          accountBalance: isAccountBalanceFilled,
          companyShareDetails: isCompanyShareDetailsFilled,
          ownerPassword: isOwnerPasswordFilled,
        },
      });
    } catch (error) {
      console.error("Error checking user fields:", error);
      res.status(500).json({ message: "Error checking user fields", error });
    }
  };
  