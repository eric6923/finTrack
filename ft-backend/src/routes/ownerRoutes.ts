import express, { Request, Response } from "express";
import { verifyControlPanelPassword } from "../controllers/user-feature/controlPanelController";
import { verifyUser } from "../middleware/userMiddleware";

const router = express.Router();



router.post("/verify-password",verifyUser, async (req: Request, res: Response) => {
    try {
      await verifyControlPanelPassword(req, res); // Ensure this is awaited
    } catch (error) {
      res.status(500).json({ error: "Error during verification process." });
    }
  });

  export default router;

