import express, { Request, Response } from "express";
import { userRegister, userLogin } from "../controllers/Auth/userController";

const router = express.Router();

router.post("/regrequest", async (req: Request, res: Response) => {
  await userRegister(req, res);
});

router.post("/login", async (req: Request, res: Response) => {
  await userLogin(req, res);
});

export default router;