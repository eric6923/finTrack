import express, { Request, Response } from "express";
import { userRegister, userLogin } from "../controllers/Auth/userController";
import { 
  createTransaction, 
  getAllTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction,
  getTransactions,
  getPayLaterTransactions
} from "../controllers/user-feature/transactionController";

import { createCategory,getCategoriesByUser } from "../controllers/user-feature/categoryController";

import { setOwnerPassword } from "../controllers/user-feature/password/passwordController";

import { verifyUser } from "../middleware/userMiddleware";
import { verify } from "jsonwebtoken";
import { checkOwner } from "../middleware/checkOwner";

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

// Update a transaction
router.put('transaction/:id',verifyUser, async (req: Request, res: Response) => {
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




//prtected routes

router.get('/settings',verifyUser,checkOwner, async (req: Request, res: Response) => {
  try {
    await res.send("setting") // Ensure this is awaited
  } catch (error) {
    res.status(500).json({ error: "error seeing settings" });
  }
});



export default router;
