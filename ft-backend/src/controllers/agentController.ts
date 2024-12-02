import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../prisma/client";

const agentRegister = async (req: Request, res: Response) => {
  const { name, email, password, phone, address, gstin } = req.body;

  try {
    const existingAgent = await prisma.agent.findUnique({ where: { email } });
    if (existingAgent) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = await prisma.agent.create({
      data: { name, email, password: hashedPassword, phone, address, gstin },
    });

    res.status(201).json({ message: "Agent registered successfully", agent: newAgent });
  } catch (error) {
    res.status(500).json({ message: "Error registering agent", error });
  }
};

const agentLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const agent = await prisma.agent.findUnique({ where: { email } });
    if (!agent) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: agent.id, role: "agent" }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Agent login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export { agentRegister, agentLogin };
