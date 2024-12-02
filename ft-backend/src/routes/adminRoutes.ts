import express, { Request, Response } from "express";
import { adminLogin } from "../controllers/adminController";

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  await adminLogin(req, res);
});

export default router;