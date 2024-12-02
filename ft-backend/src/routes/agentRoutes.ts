import express, { Request, Response } from "express";
import { agentRegister, agentLogin } from "../controllers/agentController";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  await agentRegister(req, res);
});

router.post("/login", async (req: Request, res: Response) => {
  await agentLogin(req, res);
});

export default router;