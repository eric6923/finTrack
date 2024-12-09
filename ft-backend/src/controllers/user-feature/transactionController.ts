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
      if (!payLaterDetails?.from || !payLaterDetails?.to || !payLaterDetails?.travelDate) {
        return res.status(400).json({ message: 'Bus details (from, to, travelDate) are required when PayLater is true.' });
      }

      if (!collection || !collection.operatorId || !collection.amount) {
        return res.status(400).json({ message: 'Collection details (operatorId, amount) are required when PayLater is true.' });
      }

      if (!commission || !commission.agentId || !commission.amount) {
        return res.status(400).json({ message: 'Commission details (agentId, amount) are required when PayLater is true.' });
      }

      // Check if the referenced Bus, Operator, and Agent exist
      const bus = await prisma.bus.findUnique({ where: { id: payLaterDetails.busId } });
      if (!bus) {
        return res.status(404).json({ message: 'Bus not found.' });
      }

      const operator = await prisma.operator.findUnique({ where: { id: collection.operatorId } });
      if (!operator) {
        return res.status(404).json({ message: 'Operator not found.' });
      }

      const agent = await prisma.agent.findUnique({ where: { id: commission.agentId } });
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found.' });
      }

      // Automatically calculate dueAmount
      req.body.dueAmount = parseFloat(commission.amount) + parseFloat(collection.amount);

      // Create the transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          logType,
          desc,
          amount: parseFloat(amount), // Ensure amount is a valid Decimal
          modeOfPayment,
          transactionNo,
          categoryId,
          remarks,
          payLater,
          dueAmount: req.body.dueAmount, // Use the calculated dueAmount
          payLaterDetails: {
            create: {
              busId: bus.id,
              from: payLaterDetails.from,
              to: payLaterDetails.to,
              travelDate: new Date(payLaterDetails.travelDate), // Ensure correct Date format
            },
          },
          commission: {
            create: {
              agentId: agent.id,
              amount: parseFloat(commission.amount), // Ensure amount is a valid Decimal
            },
          },
          collection: {
            create: {
              operatorId: operator.id,
              amount: parseFloat(collection.amount), // Ensure amount is a valid Decimal
            },
          },
        },
        include: {
          category: true,
          payLaterDetails: true,
          commission: true,
          collection: true,
        },
      });

      return res.status(201).json(transaction);
    }

    // If mode of payment is UPI, ensure that transactionNo is provided
    if (modeOfPayment === 'UPI' && !transactionNo) {
      return res.status(400).json({ message: 'Transaction number is mandatory for UPI transactions.' });
    }

    // Create transaction without PayLater details
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        logType,
        desc,
        amount: parseFloat(amount), // Ensure amount is a valid Decimal
        modeOfPayment,
        transactionNo,
        categoryId,
        remarks,
        payLater: false,
      },
      include: {
        category: true,
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
    const { password, transaction } = req.body; // Extract password and transaction fields

    if (!transaction) {
      return res.status(400).json({ message: 'Transaction data is required.' });
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Check if the user is authorized to update the transaction
    if (existingTransaction.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this transaction.' });
    }

    

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id, 10) },
      data: transaction, // Use the nested transaction object
    });

    res.status(200).json({ message: 'Transaction successfully updated.', updatedTransaction });
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

    res.status(200).json({ message: 'Transaction successfully deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
};
