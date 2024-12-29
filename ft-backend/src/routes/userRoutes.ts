import express, { Request, Response } from "express";
import { userRegister, userLogin } from "../controllers/Auth/userController";
import { 
  createTransaction, 
  getAllTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction,
  getTransactions,
  getPayLaterTransactions,
  getTotalCreditAndDebit,
  getUserBalance
} from "../controllers/user-feature/transactionController";
import { payLater } from "../controllers/user-feature/paylaterController";
import { forgotPassword,resetPassword } from "../controllers/Auth/forgotPassword";

import { createCategory,getCategoriesByUser,deleteCategory } from "../controllers/user-feature/categoryController";

import { setOwnerPassword } from "../controllers/user-feature/password/passwordController";
import { calculateProfitByDateRange } from "../controllers/user-feature/profitController";

import { verifyUser } from "../middleware/userMiddleware";
import { verify } from "jsonwebtoken";
import { checkOwner } from "../middleware/checkOwner";
import { getAgents,getBuses,getOperators } from "../controllers/user-feature/controlPanelController";

import { getFilteredTransactions } from "../controllers/user-feature/filterController";

const router = express.Router();

// User registration request
router.post("/regrequest", async (req: Request, res: Response) => {
  try {
    await userRegister(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error during registration request." });
  }
});

// User login
router.post("/login", async (req: Request, res: Response) => {
  try {
    await userLogin(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error during login." });
  }
}); 

// Create a new transaction
router.post('/transaction/create',verifyUser, async (req: Request, res: Response) => {
  try {
    await createTransaction(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error creating transaction." });
  }
});

router.post('/category/create',verifyUser, async (req: Request , res:Response)=>{
  await createCategory(req,res);
} );

router.get('/category',verifyUser, async (req: Request , res:Response)=>{
  await getCategoriesByUser(req,res);
} );

router.delete('/category/:id',verifyUser, async (req: Request , res:Response)=>{
  await deleteCategory(req,res);
} );

// Get all categories created by a user

// Get all transactions for a user
router.get('/transactions',verifyUser, async (req: Request, res: Response) => {
  try {
    await getAllTransactions(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching transactions." });
  }
});

router.get('/transactions/paylater',verifyUser, async (req: Request, res: Response) => {
  try {
    await getPayLaterTransactions(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching transactions." });
  }
});

router.get('/transaction',verifyUser, async (req: Request, res: Response) => {
  try {
    await getTransactions(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching transactions." });
  }
});

// Get a specific transaction by ID
router.get('/transaction/:id',verifyUser, async (req: Request, res: Response) => {
  try {
    await getTransactionById(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching transaction by ID." });
  }
});

router.get('/bus',verifyUser, async (req: Request, res: Response) => {
  try {
    await getBuses(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching bus." });
  }
});

router.get('/agent',verifyUser, async (req: Request, res: Response) => {
  try {
    await getAgents(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching agent" });
  }
});

router.get('/operator',verifyUser, async (req: Request, res: Response) => {
  try {
    await getOperators(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching operators" });
  }
});

router.get('/total',verifyUser, async (req: Request, res: Response) => {
  try {
    await getTotalCreditAndDebit(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching values" });
  }
});

router.get('/balances',verifyUser, async (req: Request, res: Response) => {
  try {
    await getUserBalance(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error fetching Balances" });
  }
});


//protected routes
// Update a transaction
router.put('/transaction/:id',verifyUser,checkOwner, async (req: Request, res: Response) => {
  try {
    await updateTransaction(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error updating transaction." });
  }
});

// Delete a transaction
router.delete('/transaction/:id',verifyUser,checkOwner, async (req: Request, res: Response) => {
  try {
    await deleteTransaction(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "Error deleting transaction." });
  }
});

router.post('/set-owner-password',verifyUser, async (req: Request, res: Response) => {
  try {
    await setOwnerPassword(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error setting password" });
  }
});

//paylater

router.post('/paylater/:transactionId',verifyUser, async (req: Request, res: Response) => {
  try {
    await payLater(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error clearing Dues" });
  }
});

//filter

router.get('/filter-transaction',verifyUser, async (req: Request, res: Response) => {
  try {
    await getFilteredTransactions(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error fetching filters" });
  }
});

//TP - profit
router.get('/profit',verifyUser, async (req: Request, res: Response) => {
  try {
    await calculateProfitByDateRange(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error fetching profit value" });
  }
});

//forgot password

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    await forgotPassword(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error sending mail" });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    await resetPassword(req, res); // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error resetting password" });
  }
});

//protected routes

router.get('/settings',verifyUser,checkOwner, async (req: Request, res: Response) => {
  try {
    await res.send("setting") // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error seeing settings" });
  }
});



export default router;
