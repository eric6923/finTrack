import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface CustomRequest extends Request {
    user?: {
      id: string; // User ID from the token
      role: string; // User role, e.g., "user" or "admin"
    };
  }

export const getFilteredTransactions = async (req: CustomRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id); // Assuming `verifyUser` middleware adds `user` to the request
    const { category, logType, modeOfPayment, payLater, operatorName, agentName, busName } = req.query;

    // Construct Prisma `where` clause dynamically
    const filters: any = {
      userId, // Include the user's ID to fetch only their transactions
      ...(category && { category: { name: String(category) } }),
      ...(logType && { logType: String(logType) }),
      ...(modeOfPayment && { modeOfPayment: String(modeOfPayment) }),
      ...(payLater !== undefined && { payLater: payLater === 'true' }), // Boolean conversion
      ...(operatorName && { collection: { operator: { name: String(operatorName) } } }),
      ...(agentName && { commission: { agent: { name: String(agentName) } } }),
      ...(busName && { payLaterDetails: { bus: { name: String(busName) } } }),
    };

    const transactions = await prisma.transaction.findMany({
      where: filters,
      include: {
        category: true,          // Include category details
        collection: {            // Include operator details if linked
          include: { operator: true },
        },
        commission: {            // Include agent details if linked
          include: { agent: true },
        },
        payLaterDetails: {       // Include bus details if linked
          include: { bus: true },
        },
      },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    res.status(500).json({ error: "Failed to fetch filtered transactions" });
  }
};
