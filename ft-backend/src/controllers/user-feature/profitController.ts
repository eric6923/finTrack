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
  
      // Date parsing logic (same as before)
      if (!date && !startDate && !endDate) {
        startDateParsed = new Date(0);
        endDateParsed = new Date();
      } else if (date) {
        if (date.length === 10) {
          startDateParsed = startOfDay(parseISO(date as string));
          endDateParsed = endOfDay(parseISO(date as string));
        } else if (date.length === 7) {
          startDateParsed = startOfMonth(parseISO(date as string + '-01'));
          endDateParsed = endOfMonth(parseISO(date as string + '-01'));
        } else {
          return res.status(400).json({ error: 'Invalid date format' });
        }
      } else if (startDate && endDate) {
        startDateParsed = parseISO(startDate as string);
        endDateParsed = parseISO(endDate as string);
  
        if (!isValid(startDateParsed) || !isValid(endDateParsed)) {
          return res.status(400).json({ error: 'Invalid date range' });
        }
      } else {
        return res.status(400).json({ error: 'Please provide a valid date or date range' });
      }
  
      // Fetch CREDIT transactions
      const creditTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          logType: 'CREDIT',
          OR: [
            { payLater: false },
            { payLater: true, dueAmount: 0 },
          ],
          createdAt: {
            gte: startDateParsed,
            lte: endDateParsed,
          },
        },
        include: {
          commission: true,
          collection: true,
        },
      });
  
      // Fetch DEBIT transactions
      const debitTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          logType: 'DEBIT',
          createdAt: {
            gte: startDateParsed,
            lte: endDateParsed,
          },
        },
      });
  
      // Calculate profit for CREDIT transactions
      const creditProfits = creditTransactions.map((transaction) => {
        const agentAmount = transaction.commission?.amount.toNumber() || 0;
        const operatorAmount = transaction.collection?.amount.toNumber() || 0;
        const profit = transaction.amount.toNumber() - (agentAmount + operatorAmount);
  
        return {
          transactionId: transaction.id,
          amount: transaction.amount.toNumber(),
          agentAmount,
          operatorAmount,
          profit,
        };
      });
  
      // Calculate total CREDIT profit
      const totalCreditProfit = creditProfits.reduce((sum, tx) => sum + tx.profit, 0);
  
      // Calculate total DEBIT amount
      const totalDebitAmount = debitTransactions.reduce(
        (sum, tx) => sum + tx.amount.toNumber(),
        0
      );
  
      // Adjust profit by subtracting DEBIT amount
      const adjustedProfit = totalCreditProfit - totalDebitAmount;
  
      // Respond with data
      res.status(200).json({
        transactions: creditProfits,
        totalCreditProfit,
        totalDebitAmount,
        adjustedProfit,
      });
    } catch (error) {
      console.error('Error calculating profit:', error);
      res.status(500).json({ error: 'Failed to calculate profit' });
    }
  };
  