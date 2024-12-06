import { Request, Response } from 'express';
import prisma from "../../../prisma/client";
import { parseISO, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';




interface CustomRequest extends Request {
  user?: {
    id: string; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}

// Create a transaction
export const createTransaction = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id); // Get userId from token
    const logType = req.query.logType as string; // Get logType from query params

    // Ensure logType is valid (either CREDIT or DEBIT)
    if (logType !== 'CREDIT' && logType !== 'DEBIT') {
      return res.status(400).json({ message: 'Invalid logType. Must be either "CREDIT" or "DEBIT".' });
    }

    const {
      desc,
      amount,
      modeOfPayment,
      transactionNo,
      categoryId,
      remarks,
      payLater,
      payLaterDetails,
      commission,
      collection,
      dueAmount,
    } = req.body;

    // Ensure 'amount' is provided and is a valid number
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ message: 'Invalid amount provided.' });
    }

    // Ensure payLater can only be true for logType === 'CREDIT'
    if (payLater && logType !== 'CREDIT') {
      return res.status(400).json({ message: 'PayLater can only be true for CREDIT transactions.' });
    }

    // If logType is 'CREDIT' and payLater is true, ensure required fields are provided
    if (logType === 'CREDIT' && payLater) {
      if (!payLaterDetails?.busName || !payLaterDetails?.from || !payLaterDetails?.to || !payLaterDetails?.travelDate) {
        return res.status(400).json({ message: 'Bus details (busName, from, to, travelDate) are required when PayLater is true.' });
      }

      if (!collection || !collection.operatorName || !collection.amount) {
        return res.status(400).json({ message: 'Collection details (operatorName, amount) are required when PayLater is true.' });
      }

      if (!commission || !commission.agentName || !commission.amount) {
        return res.status(400).json({ message: 'Commission details (agentName, amount) are required when PayLater is true.' });
      }

      if (!dueAmount || isNaN(parseFloat(dueAmount))) {
        return res.status(400).json({ message: 'Due amount is required when PayLater is true.' });
      }
    }

    // If mode of payment is UPI, ensure that transactionNo is provided
    if (modeOfPayment === 'UPI' && !transactionNo) {
      return res.status(400).json({ message: 'Transaction number is mandatory for UPI transactions.' });
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        logType,
        desc,
        amount,
        modeOfPayment,
        transactionNo,
        categoryId,
        remarks,
        payLater,
        dueAmount,
        payLaterDetails: payLater
          ? {
              create: {
                busName: payLaterDetails.busName,
                from: payLaterDetails.from,
                to: payLaterDetails.to,
                travelDate: payLaterDetails.travelDate,
              },
            }
          : undefined,
        commission: commission
          ? {
              create: {
                agentName: commission.agentName,
                amount: commission.amount,
              },
            }
          : undefined,
        collection: collection
          ? {
              create: {
                operatorName: collection.operatorName,
                amount: collection.amount,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        payLaterDetails: true,
        commission: true,
        collection: true,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating transaction', error });
  }
};

// Get all transactions for a user
export const getTransactions = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const { Date: dateParam, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Handle date range filtering (startDate and endDate)
    if (startDate && endDate) {
      let parsedStartDate, parsedEndDate;

      try {
        parsedStartDate = startOfDay(parseISO(String(startDate)));
        parsedEndDate = endOfDay(parseISO(String(endDate)));
      } catch (error) {
        return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD for startDate and endDate.' });
      }

      return getTransactionsForPeriod(userId, parsedStartDate, parsedEndDate, res);
    }

    // Check if the Date parameter is in YYYY-MM-DD or YYYY-MM format
    const dateParts = dateParam && typeof dateParam === 'string' ? dateParam.split('-') : [];
    
    // If it's a full date (YYYY-MM-DD), filter for that specific day
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      const fullDate = `${year}-${month}-${day}`;

      let parsedDate;
      try {
        parsedDate = parseISO(fullDate);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
      }

      const startOfDayUTC = startOfDay(parsedDate);
      const endOfDayUTC = endOfDay(parsedDate);

      return getTransactionsForPeriod(userId, startOfDayUTC, endOfDayUTC, res);
    }

    // If it's a month (YYYY-MM), filter for the entire month
    if (dateParts.length === 2) {
      const [year, month] = dateParts;

      let parsedMonth;
      try {
        parsedMonth = new Date(`${year}-${month}-01`);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid month format. Please use YYYY-MM.' });
      }

      const startOfMonthUTC = startOfMonth(parsedMonth);
      const endOfMonthUTC = endOfMonth(parsedMonth);

      return getTransactionsForPeriod(userId, startOfMonthUTC, endOfMonthUTC, res);
    }

    res.status(400).json({ message: 'Invalid Date format. Please use YYYY-MM-DD, YYYY-MM, or provide startDate and endDate.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};


export const getPayLaterTransactions = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Fetch transactions where payLater is true (payLaterDetails is not null)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        payLaterDetails: {
          isNot: null, // Filter only transactions with payLater details
        },
      },
      include: {
        category: true,
        payLaterDetails: true,
        commission: true,
        collection: true,
      },
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No pay later transactions found.' });
    }

    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pay later transactions', error });
  }
};


// Helper function to handle the filtering of transactions by date range
const getTransactionsForPeriod = async (userId: number, startDate: Date, endDate: Date, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
      payLaterDetails: true,
      commission: true,
      collection: true,
    },
  });

  if (transactions.length === 0) {
    return res.status(404).json({ message: 'No logs found for the selected period.' });
  }

  return res.status(200).json(transactions);
};



export const getAllTransactions = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id); // Ensure it's a number

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: userId }, // Ensure userId is correctly passed
      include: {
        category: true,
        payLaterDetails: true,
        commission: true,
        collection: true,
      },
    });

    res.status(200).json(transactions); // Return the transactions
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

// Get a specific transaction by ID
export const getTransactionById = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.id); // Get userId from token

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        category: true,
        payLaterDetails: true,
        commission: true,
        collection: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if the user is authorized to view the transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to view this transaction.' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transaction', error });
  }
};

// Update a transaction
export const updateTransaction = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.id); // Get userId from token
    const updateData = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if the user is authorized to update the transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this transaction.' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating transaction', error });
  }
};

// Delete a transaction
export const deleteTransaction = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.id); // Get userId from token

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if the user is authorized to delete the transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this transaction.' });
    }

    await prisma.transaction.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
};
