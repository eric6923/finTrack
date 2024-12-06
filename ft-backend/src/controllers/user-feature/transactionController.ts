import { Request, Response } from 'express';
import prisma from "../../../prisma/client";
import { startOfDay, endOfDay, parseISO } from 'date-fns';



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
    const { Date: date } = req.query; // Get the 'Date' query parameter

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Validate the date query parameter
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ message: 'Date query parameter is required and must be a string.' });
    }

    // Try parsing the date
    let parsedDate;
    try {
      parsedDate = parseISO(date); // Parse the provided date string into a Date object
    } catch (error) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Start and end of the day (in UTC)
    const startOfDayUTC = startOfDay(parsedDate); // start of the day
    const endOfDayUTC = endOfDay(parsedDate);     // end of the day

    // Fetch transactions from the database for the specific user and date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfDayUTC, // Greater than or equal to the start of the day in UTC
          lte: endOfDayUTC,   // Less than or equal to the end of the day in UTC
        },
      },
      include: {
        category: true,
        payLaterDetails: true,
        commission: true,
        collection: true,
      },
    });

    // If no transactions are found for the day, return an error message
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No logs found for the selected date.' });
    }

    // Return the filtered transactions
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
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
