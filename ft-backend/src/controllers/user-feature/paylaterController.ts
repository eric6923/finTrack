import { Request, Response } from 'express';
import prisma from "../../../prisma/client";
import { Decimal } from '@prisma/client/runtime/library';

interface CustomRequest extends Request {
  user?: {
    id: string; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}

export const payLater = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const { paymentType, operatorAmount, agentAmount, modeOfPayment, transactionNumber } = req.body;
    const { transactionId } = req.params;

    // Validate transactionId
    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required." });
    }

    // Validate paymentType
    if (!["FULL", "PARTIAL"].includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type. Must be FULL or PARTIAL." });
    }

    // Validate modeOfPayment
    if (!["CASH", "UPI"].includes(modeOfPayment)) {
      return res.status(400).json({ message: "Invalid mode of payment. Must be CASH or UPI." });
    }

    // For UPI, ensure transactionNumber is provided
    if (modeOfPayment === "UPI" && !transactionNumber) {
      return res.status(400).json({ message: "Transaction number is required for UPI payments." });
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(transactionId) },
      include: { collection: true, commission: true },
    });

    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: "Transaction not found or unauthorized." });
    }

    // Retrieve the user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let totalPayment = new Decimal(0);

    // Handle Partial Payment
    if (paymentType === "PARTIAL") {
      if (operatorAmount == null || agentAmount == null) {
        return res.status(400).json({ message: "Operator and agent amounts are required for partial payment." });
      }

      totalPayment = new Decimal(operatorAmount).add(new Decimal(agentAmount));
      if (totalPayment.greaterThan(transaction.dueAmount || 0)) {
        return res.status(400).json({ message: "Partial payment exceeds the due amount." });
      }

      // Update dueAmount in the transaction
      const updatedDueAmount = new Decimal(transaction.dueAmount || 0).sub(totalPayment);

      await prisma.transaction.update({
        where: { id: Number(transactionId) },
        data: {
          dueAmount: updatedDueAmount,
          paymentType: "PARTIAL",
        },
      });

      // Deduct from the appropriate balance based on mode of payment
      let updatedBoxBalance = user.boxBalance;
      let updatedAccountBalance = user.accountBalance;

      if (modeOfPayment === "CASH") {
        updatedBoxBalance = new Decimal(user.boxBalance).sub(totalPayment);
      } else if (modeOfPayment === "UPI") {
        updatedAccountBalance = new Decimal(user.accountBalance).sub(totalPayment);
      }

      // Update the User's due balance and the selected balance
      const updatedUserDue = new Decimal(user.due).sub(totalPayment);

      await prisma.user.update({
        where: { id: userId },
        data: {
          due: updatedUserDue,
          boxBalance: updatedBoxBalance,
          accountBalance: updatedAccountBalance,
        },
      });

      return res.status(200).json({
        message: "Partial payment recorded successfully.",
        remainingDue: updatedDueAmount,
      });
    }

    // Handle Full Payment
    if (paymentType === "FULL") {
      totalPayment = new Decimal(transaction.dueAmount || 0);

      // Update the transaction
      await prisma.transaction.update({
        where: { id: Number(transactionId) },
        data: {
          dueAmount: new Decimal(0),
          paymentType: "FULL",
        },
      });

      // Deduct from the appropriate balance based on mode of payment
      let updatedBoxBalance = user.boxBalance;
      let updatedAccountBalance = user.accountBalance;

      if (modeOfPayment === "CASH") {
        updatedBoxBalance = new Decimal(user.boxBalance).sub(totalPayment);
      } else if (modeOfPayment === "UPI") {
        updatedAccountBalance = new Decimal(user.accountBalance).sub(totalPayment);
      }

      // Update the User's due balance and the selected balance
      const updatedUserDue = new Decimal(user.due).sub(totalPayment);

      await prisma.user.update({
        where: { id: userId },
        data: {
          due: updatedUserDue,
          boxBalance: updatedBoxBalance,
          accountBalance: updatedAccountBalance,
        },
      });

      return res.status(200).json({ message: "Full payment recorded successfully." });
    }
  } catch (error) {
    console.error("Error processing payLater:", error);
    res.status(500).json({ message: "An error occurred while processing the payment.", error });
  }
};
