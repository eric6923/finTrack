import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';


const prisma = new PrismaClient();

interface CustomRequest extends Request {
    user?: {
      id: string; // User ID from the token
      role: string; // User role, e.g., "user" or "admin"
    };
  }
  

  export const calculateProfitByDateRange = async (req: CustomRequest, res: Response) => {
    try {
        const userId = Number(req.user?.id);

  
      const { date, startDate, endDate } = req.query;
  
      let startDateParsed;
      let endDateParsed;
  
      // If no date params are provided, fetch all transactions
      if (!date && !startDate && !endDate) {
        startDateParsed = new Date(0); // Earliest date (1970-01-01)
        endDateParsed = new Date(); // Current date (now)
      } 
      // If 'date' is provided (daily or monthly filter)
      else if (date) {
        if (date.length === 10) {  // Format: YYYY-MM-DD for daily
          startDateParsed = startOfDay(parseISO(date as string));
          endDateParsed = endOfDay(parseISO(date as string));
        } else if (date.length === 7) {  // Format: YYYY-MM for monthly
          startDateParsed = startOfMonth(parseISO(date as string + '-01'));
          endDateParsed = endOfMonth(parseISO(date as string + '-01'));
        } else {
          return res.status(400).json({ error: 'Invalid date format' });
        }
      }
      // If custom range is provided
      else if (startDate && endDate) {
        startDateParsed = parseISO(startDate as string);
        endDateParsed = parseISO(endDate as string);
  
        if (!isValid(startDateParsed) || !isValid(endDateParsed)) {
          return res.status(400).json({ error: 'Invalid date range' });
        }
      } else {
        return res.status(400).json({ error: 'Please provide a valid date or date range' });
      }
  
      // Fetch eligible CREDIT transactions within the date range
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          logType: 'CREDIT',
          OR: [
            { payLater: false }, // Direct credits
            { payLater: true, dueAmount: 0 }, // PayLater credits with cleared dues
          ],
          createdAt: {
            gte: startDateParsed,
            lte: endDateParsed,
          },
        },
        include: {
          commission: true, // Include agent commission
          collection: true, // Include operator collection
        },
      });
  
      // Calculate profit for each transaction
      const transactionProfits = transactions.map((transaction) => {
        const agentAmount = transaction.commission?.amount.toNumber() || 0; // Convert Decimal to number
        const operatorAmount = transaction.collection?.amount.toNumber() || 0; // Convert Decimal to number
        const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount); // Convert Decimal to number
  
        return {
          transactionId: transaction.id,
          amount: transaction.amount.toNumber(), // Convert Decimal to number
          agentAmount,
          operatorAmount,
          profit,
        };
      });
  
      // Optional: Calculate total profit for the date range
      const totalProfit = transactionProfits.reduce((sum, tx) => sum + tx.profit, 0);
  
      res.status(200).json({
        transactions: transactionProfits,
        totalProfit,
      });
    } catch (error) {
      console.error('Error calculating profit:', error);
      res.status(500).json({ error: 'Failed to calculate profit' });
    }
  };