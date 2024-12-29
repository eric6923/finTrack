import express, { Request, Response } from "express";
import { adminLogin } from "../controllers/Auth/adminController";
import { verifyRole } from "../middleware/authMiddleware";
import { getAllPendingUsers,rejectPendingUser,submitPaymentVerification,verifyPaymentAndApproveUser,getAllUsers } from "../controllers/admin-feature/pendingUser";


const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  await adminLogin(req, res);
}); 

router.get("/users",verifyRole, async (req: Request, res: Response) => {
  await getAllUsers(req, res);
});
router.get("/pending-request",verifyRole, async (req: Request, res: Response) => {
  await getAllPendingUsers(req, res);
});

router.post("/payment-verification/:pendingUserId", verifyRole, async (req: Request, res: Response) => {
  await submitPaymentVerification(req, res);
});


router.post("/approve/:pendingUserId", verifyRole, async (req: Request, res: Response) => {
  await verifyPaymentAndApproveUser(req, res);
});

router.delete('/reject/:pendingUserId', verifyRole, rejectPendingUser);

export default router;