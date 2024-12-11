import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateProfitByDateRange } from './user-feature/profitController';
import { parseISO } from 'date-fns';

const prisma = new PrismaClient();

interface CustomRequest extends Request {
  user?: {
    id: string; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}


// Controller for creating company shares
export const createCompanyShares = async (req: CustomRequest, res: Response) => {
  const {
    businessName,
    businessCategory,
    businessType,
    numberOfShareHolders,
    shareholders, // This is an array of shareholder objects (name and share percentage)
  } = req.body;

  try {
    // Find the user by userId (assuming userId is passed via the session or token)
    const userId = Number(req.user?.id);

    // If the businessType is 'sole proprietorship' or 'OPC', skip numberOfShareHolders
    if ((businessType === 'Sole Proprietorship' || businessType === 'OPC') && numberOfShareHolders > 0) {
      return res.status(400).json({
        error: 'No shareholders required for Sole Proprietorship or OPC business type',
      });
    }

    // Check if the number of shareholders matches the number of shareholder data provided
    if (shareholders.length !== numberOfShareHolders) {
      return res.status(400).json({
        error: `Expected ${numberOfShareHolders} shareholders, but got ${shareholders.length}`,
      });
    }

    // Create company share details and shareholders
    const companyShareDetails = await prisma.companyShareDetails.create({
      data: {
        businessName,
        businessCategory,
        businessType,
        numberOfShareHolders,
        user: { connect: { id: userId } }, // Connect company share details to user
        shareholders: {
          create: shareholders.map((shareholder: { name: string; sharePercentage: number }) => ({
            name: shareholder.name,
            sharePercentage: shareholder.sharePercentage,
          })),
        },
      },
    });

    return res.status(201).json({
      message: 'Company shares created successfully!',
      data: companyShareDetails,
    });
  } catch (error) {
    console.error('Error creating company shares:', error);
    return res.status(500).json({
      error: 'Failed to create company shares',
    });
  }
};


export const getTotalProfitByMonth = async (startDate: string, endDate: string): Promise<number> => {
    try {
      // Fetch transactions and calculate profit for the given date range
      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          logType: 'CREDIT',
          OR: [
            { payLater: false }, 
            { payLater: true, dueAmount: 0 },
          ],
        },
        include: {
          commission: true, 
          collection: true, 
        },
      });
  
      const totalProfit = transactions.reduce((sum, transaction) => {
        const agentAmount = transaction.commission?.amount.toNumber() || 0;
        const operatorAmount = transaction.collection?.amount.toNumber() || 0;
        const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount);
        return sum + profit;
      }, 0);
  
      return totalProfit;
    } catch (error) {
      console.error('Error calculating monthly profit:', error);
      return 0; // Default to 0 if an error occurs
    }
  };


  export const calculateShareDistribution = async (req: CustomRequest, res: Response) => {
    try {
      const userId = Number(req.user?.id);
  
      // Fetch the company share details for the user
      const companyShares = await prisma.companyShareDetails.findUnique({
        where: { userId },
        include: { shareholders: true },
      });
  
      // Validate company shares exist
      if (!companyShares || !companyShares.shareholders) {
        return res.status(400).json({ error: 'Company share details not found' });
      }
  
      const { date } = req.query;
  
      // Validate date format
      if (!date || typeof date !== 'string' || date.length !== 7) {
        return res.status(400).json({ error: 'Provide date in YYYY-MM format' });
      }
  
      // Prepare date range for profit calculation
      const startOfMonth = parseISO(`${date}-01`);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  
      // Call the new function to get the total profit for the specified month
      const totalProfit = await getTotalProfitByMonth(startOfMonth.toISOString(), endOfMonth.toISOString());
  
      // Distribute profit among shareholders
      const shareDistribution = companyShares.shareholders.map((shareholder) => {
        const shareholderProfit = (totalProfit * shareholder.sharePercentage) / 100;
        return {
          shareholder: shareholder.name,
          percentage: shareholder.sharePercentage,
          shareProfit: shareholderProfit,
        };
      });
  
      // Return distribution details
      res.status(200).json({
        month: date,
        totalProfit,
        shareDistribution,
      });
    } catch (error) {
      console.error('Share Distribution Error:', error);
      res.status(500).json({ error: 'Failed to calculate share distribution' });
    }
  };
  
