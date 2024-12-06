import { Request, Response } from 'express';
import prisma from "../../../prisma/client";

interface CustomRequest extends Request {
  user?: {
    id: string; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}

// Create a transaction
// Create a transaction
// Create a transaction
// Create a transaction
export const createTransaction = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
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
      payLaterDetails, // PayLater details object from body
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
      // Check if payLaterDetails (busName, from, to, travelDate) are provided
      if (!payLaterDetails?.busName || !payLaterDetails?.from || !payLaterDetails?.to || !payLaterDetails?.travelDate) {
        return res.status(400).json({ message: 'Bus details (busName, from, to, travelDate) are required when PayLater is true.' });
      }

      // Check if collection and commission details are provided
      if (!collection || !collection.operatorName || !collection.amount) {
        return res.status(400).json({ message: 'Collection details (operatorName, amount) are required when PayLater is true.' });
      }

      if (!commission || !commission.agentName || !commission.amount) {
        return res.status(400).json({ message: 'Commission details (agentName, amount) are required when PayLater is true.' });
      }

      // Ensure dueAmount is provided if payLater is true
      if (!dueAmount || isNaN(parseFloat(dueAmount))) {
        return res.status(400).json({ message: 'Due amount is required when PayLater is true.' });
      }
    }

    // If mode of payment is UPI, ensure that transactionNo is provided
    if (modeOfPayment === 'UPI' && !transactionNo) {
      return res.status(400).json({ message: 'Transaction number is mandatory for UPI transactions.' });
    }

    // If mode of payment is cash, transactionNo is optional, no validation required

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        logType,
        desc, // Description
        amount, // Amount
        modeOfPayment,
        transactionNo, // Include the transactionNo, even if it's optional
        categoryId,
        remarks,
        payLater,
        dueAmount, // Only provided if payLater is true
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

    res.status(201).json(transaction); // Return the created transaction with all related data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating transaction', error });
  }
};



// Get all transactions for a user
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { userId: parseInt(userId, 10) },
      include: {
        category: true,
        payLaterDetails: true,
        commission: true,
        collection: true,
      },
    });

    res.status(200).json(transactions); // Return all transactions for the user
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

// Get a specific transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    res.status(200).json(transaction); // Return the specific transaction
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transaction', error });
  }
};

// Update a transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    res.status(200).json(updatedTransaction); // Return the updated transaction
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating transaction', error });
  }
};

// Delete a transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.transaction.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send(); // Successfully deleted the transaction
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
};
