import express, { Request, Response } from "express";
import { adminLogin } from "../controllers/Auth/adminController";
import { verifyRole } from "../middleware/authMiddleware";
import { getAllPendingUsers,rejectPendingUser } from "../controllers/admin-feature/pendingUser";


const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  await adminLogin(req, res);
}); 

router.get("/pending-request",verifyRole, async (req: Request, res: Response) => {
  await getAllPendingUsers(req, res);
});

router.delete('/reject/:pendingUserId', verifyRole, rejectPendingUser);

export default router;