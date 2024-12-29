import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../../prisma/client';
import { Prisma } from '@prisma/client';

interface CustomRequest extends Request {
  user?: {
    id: number; 
    role: string;
  };
}

export const verifyControlPanelPassword = async (req: CustomRequest, res: Response) => {
  try {
    const { password } = req.body; // Password provided by the user
    const userId = req.user?.id; // User ID from the verified token

    // Validate required inputs
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in the token.' });
    }

    // Fetch the hashed owner password from the database
    const ownerPasswordRecord = await prisma.ownerPassword.findUnique({
      where: { userId },
    });

    if (!ownerPasswordRecord) {
      return res.status(404).json({ message: 'Owner password not set for this user.' });
    }

    // Compare the provided password with the stored hashed password
    const isValidPassword = await bcrypt.compare(password, ownerPasswordRecord.password);

    if (!isValidPassword) {
      return res.status(403).json({ message: 'Invalid password.' });
    }

    // If the password is valid, return success
    res.status(200).json({ message: 'Password verified successfully.' });
  } catch (error) {
    console.error('Error verifying control panel password:', error);
    res.status(500).json({ message: 'Error verifying password.'});
  }
};

export const createBus = async (req: CustomRequest, res: Response) => {
  const { name } = req.body;
  const userId = Number(req.user?.id);
  const normalizedName = name.trim().toUpperCase();

  if (!normalizedName) {
    return res.status(400).json({ message: 'Bus name is required' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User authentication failed' });
  }

  try {
    // First, verify that the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a bus with this name already exists for this user
    const existingBus = await prisma.bus.findFirst({
      where: {
        name: normalizedName,
        userId, // Ensure that the bus name is unique to this user
      },
    });

    if (existingBus) {
      return res.status(400).json({ message: 'A bus with this name already exists for this user' });
    }

    // Create the bus
    const bus = await prisma.bus.create({
      data: {
        name: normalizedName,
        userId,
      },
    });

    return res.status(201).json(bus);
  } catch (error) {
    console.error('Bus creation error:', error);
    
    // More specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return res.status(500).json({ 
          message: 'Foreign key constraint failed. Ensure the user exists.',
          error: error.message 
        });
      }
    }

    return res.status(500).json({ 
      message: 'Error creating bus', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// Delete a bus
export const deleteBus = async (req: CustomRequest, res: Response) => {
  const userId = Number(req.user?.id); // User ID from the authenticated user
  const busId = req.params.id ? Number(req.params.id) : null; // Bus ID from the request parameters

  if (!userId) {
    return res.status(401).json({ message: 'User authentication failed' });
  }

  if (!busId) {
    return res.status(400).json({ message: 'Bus ID is required' });
  }

  try {
    // Check if the bus exists and belongs to the user
    const existingBus = await prisma.bus.findFirst({
      where: {
        id: busId,
        userId, // Ensure the bus belongs to the authenticated user
      },
    });

    if (!existingBus) {
      return res.status(404).json({ message: 'Bus not found or does not belong to the user' });
    }

    // Delete the bus
    await prisma.bus.delete({
      where: { id: busId },
    });

    return res.status(200).json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Bus deletion error:', error);

    // More specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ 
          message: 'The bus does not exist or has already been deleted.',
          error: error.message 
        });
      }
    }

    return res.status(500).json({ 
      message: 'Error deleting bus', 
      error: error instanceof Error ? error.message : error 
    });
  }
};


  
export const createAgent = async (req: CustomRequest, res: Response) => {
  const { name } = req.body;
  const userId = Number(req.user?.id);
  const normalizedName = name.trim().toUpperCase();

  if (!normalizedName) {
    return res.status(400).json({ message: 'Agent name is required' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User authentication failed' });
  }

  try {
    // First, verify that the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if an agent with this name already exists for this user
    const existingAgent = await prisma.agent.findFirst({
      where: {
        name: normalizedName,
        userId, // Ensure the agent name is unique for this user
      },
    });

    if (existingAgent) {
      return res.status(400).json({ message: 'An agent with this name already exists for this user' });
    }

    // Create the agent
    const agent = await prisma.agent.create({
      data: {
        name: normalizedName,
        userId,
      },
    });

    return res.status(201).json(agent);
  } catch (error) {
    console.error('Agent creation error:', error);
    
    // More specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return res.status(500).json({ 
          message: 'Foreign key constraint failed. Ensure the user exists.',
          error: error.message 
        });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          message: 'An agent with this name already exists',
          error: error.message 
        });
      }
    }

    return res.status(500).json({ 
      message: 'Error creating agent', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// Delete an agent
export const deleteAgent = async (req: CustomRequest, res: Response) => {
  const userId = Number(req.user?.id); // Authenticated user's ID
  const agentId = req.params.id ? Number(req.params.id) : null; // Agent ID from the request params

  if (!userId) {
    return res.status(401).json({ message: 'User authentication failed' });
  }

  if (!agentId) {
    return res.status(400).json({ message: 'Agent ID is required' });
  }

  try {
    // Check if the agent exists and belongs to the user
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId, // Ensure the agent belongs to the authenticated user
      },
    });

    if (!existingAgent) {
      return res.status(404).json({ message: 'Agent not found or does not belong to the user' });
    }

    // Delete the agent
    await prisma.agent.delete({
      where: { id: agentId },
    });

    return res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Agent deletion error:', error);

    // More specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          message: 'The agent does not exist or has already been deleted.',
          error: error.message,
        });
      }
    }

    return res.status(500).json({
      message: 'Error deleting agent',
      error: error instanceof Error ? error.message : error,
    });
  }
};


  
export const createOperator = async (req: CustomRequest, res: Response) => {
  const { name } = req.body;
  const userId = Number(req.user?.id);
  const normalizedName = name.trim().toUpperCase();

  if (!normalizedName) {
    return res.status(400).json({ message: 'Operator name is required' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User authentication failed' });
  }

  try {
    // First, verify that the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if an operator with this name already exists for this user
    const existingOperator = await prisma.operator.findFirst({
      where: {
        name: normalizedName,
        userId, // Ensure the operator name is unique for this user
      },
    });

    if (existingOperator) {
      return res.status(400).json({ message: 'An operator with this name already exists for this user' });
    }

    // Create the operator
    const operator = await prisma.operator.create({
      data: {
        name: normalizedName,
        userId,
      },
    });

    return res.status(201).json(operator);
  } catch (error) {
    console.error('Operator creation error:', error);
    
    // More specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return res.status(500).json({ 
          message: 'Foreign key constraint failed. Ensure the user exists.',
          error: error.message 
        });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          message: 'An operator with this name already exists',
          error: error.message 
        });
      }
    }

    return res.status(500).json({ 
      message: 'Error creating operator', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// Delete an operator
export const deleteOperator = async (req: CustomRequest, res: Response) => {
  const userId = Number(req.user?.id); // Authenticated user's ID
  const operatorId = req.params.id ? Number(req.params.id) : null; // Operator ID from the request params

  if (!userId) {
    return res.status(401).json({ message: 'User authentication failed' });
  }

  if (!operatorId) {
    return res.status(400).json({ message: 'Operator ID is required' });
  }

  try {
    // Check if the operator exists and belongs to the user
    const existingOperator = await prisma.operator.findFirst({
      where: {
        id: operatorId,
        userId, // Ensure the operator belongs to the authenticated user
      },
    });

    if (!existingOperator) {
      return res.status(404).json({ message: 'Operator not found or does not belong to the user' });
    }

    // Delete the operator
    await prisma.operator.delete({
      where: { id: operatorId },
    });

    return res.status(200).json({ message: 'Operator deleted successfully' });
  } catch (error) {
    console.error('Operator deletion error:', error);

    // More specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          message: 'The operator does not exist or has already been deleted.',
          error: error.message,
        });
      }
    }

    return res.status(500).json({
      message: 'Error deleting operator',
      error: error instanceof Error ? error.message : error,
    });
  }
};



export const getBuses = async (req: CustomRequest, res: Response) => {
    const userId = Number(req.user?.id);
  
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }
  
    try {
      // Fetch all buses for the authenticated user
      const buses = await prisma.bus.findMany({
        where: { userId },
      });
  
      if (!buses || buses.length === 0) {
        return res.status(200).json({ message: 'No buses found for this user' });
      }
  
      return res.status(200).json(buses);
    } catch (error) {
      console.error('Error fetching buses:', error);
      return res.status(500).json({ 
        message: 'Error fetching buses',
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  
export const getAgents = async (req: CustomRequest, res: Response) => {
    const userId = Number(req.user?.id);
  
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }
  
    try {
      // Fetch all agents for the authenticated user
      const agents = await prisma.agent.findMany({
        where: { userId },
      });
  
      if (!agents || agents.length === 0) {
        return res.status(200).json({ message: 'No agents found for this user' });
      }
  
      return res.status(200).json(agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      return res.status(500).json({ 
        message: 'Error fetching agents',
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  
export const getOperators = async (req: CustomRequest, res: Response) => {
    const userId = Number(req.user?.id);
  
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }
  
    try {
      // Fetch all operators for the authenticated user
      const operators = await prisma.operator.findMany({
        where: { userId },
      });
  
      if (!operators || operators.length === 0) {
        return res.status(200).json({ message: 'No operators found for this user' });
      }
  
      return res.status(200).json(operators);
    } catch (error) {
      console.error('Error fetching operators:', error);
      return res.status(500).json({ 
        message: 'Error fetching operators',
        error: error instanceof Error ? error.message : error,
      });
    }
  };
  
  export const setOpeningBalance = async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user?.id; // Extract user ID from token
      const { boxBalance, accountBalance } = req.body;
  
      // Ensure user ID is provided
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized access." });
      }
  
      // Validate the balances
      if (boxBalance === undefined || accountBalance === undefined) {
        return res
          .status(400)
          .json({ message: "Both boxBalance and accountBalance are required." });
      }
  
      if (isNaN(parseFloat(boxBalance)) || isNaN(parseFloat(accountBalance))) {
        return res
          .status(400)
          .json({ message: "Both balances must be valid numbers." });
      }
  
      const totalBalance = parseFloat(boxBalance) + parseFloat(accountBalance);
  
      // Update the user's balances in the database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          boxBalance: parseFloat(boxBalance),
          accountBalance: parseFloat(accountBalance),
        },
        select: {
          id: true,
          name: true,
          boxBalance: true,
          accountBalance: true,
        },
      });
  
      // Define the predefined categories
      const predefinedCategories = ['TEA', 'BUSBOOKING', 'MONEYTRANSFER', 'RENT'];
  
      // Loop through the categories and create them if they don't exist
      for (const categoryName of predefinedCategories) {
        const existingCategory = await prisma.category.findFirst({
          where: { name: categoryName },
        });
  
        if (!existingCategory) {
          // Create the category if it doesn't exist
          await prisma.category.create({
            data: {
              name: categoryName,
              createdBy: userId,
            },
          });
        }
      }
  
      return res.status(200).json({
        message: "Opening balances set successfully, and categories created.",
        user: updatedUser,
        totalBalance,
      });
    } catch (error) {
      console.error("Error setting opening balance:", error);
      return res.status(500).json({ message: "An error occurred.", error });
    }
  };
  