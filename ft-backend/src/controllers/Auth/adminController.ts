import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/client";

const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET!, {
      expiresIn: process.env.EXPIRES_IN,
    });

    res.status(200).json({ message: "Admin login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};



export { adminLogin };