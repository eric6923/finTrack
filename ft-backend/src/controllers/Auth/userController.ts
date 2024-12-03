import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/client";
import { Prisma } from "@prisma/client";

const userRegister = async (req: Request, res: Response) => {
  const { 
    name, 
    email, 
    userName, 
    password, 
    phone, 
    address, 
    gstin,
    aadhar,
    pan 
  } = req.body;

  try {
    // Check for existing users with unique fields
    const existingUserByEmail = await prisma.pendingUser.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUserByUsername = await prisma.pendingUser.findUnique({ where: { userName } });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingUserByAadhar = await prisma.pendingUser.findUnique({ where: { aadhar: aadhar.toString() } });
    if (existingUserByAadhar) {
      return res.status(400).json({ message: "Aadhar number already registered" });
    }

    const existingUserByPan = await prisma.pendingUser.findUnique({ where: { pan:pan.toString() } });
    if (existingUserByPan) {
      return res.status(400).json({ message: "PAN number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.pendingUser.create({
      data: { 
        name, 
        email, 
        userName,
        password: hashedPassword, 
        phone, 
        address, 
        gstin,
        aadhar,
        pan 
      },
    });

    // Remove sensitive information before sending response
    const { password: removedPassword, ...userResponse } = newUser;

    res.status(201).json({ 
      message: "User registered successfully", 
      user: userResponse 
    });
  } catch (error) {
    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint error
      if (error.code === 'P2002') {
        const targetField = (error.meta?.target as string[])?.[0];
        return res.status(400).json({ 
          message: `${targetField ? targetField.charAt(0).toUpperCase() + targetField.slice(1) : 'Field'} must be unique` 
        });
      }
    }

    // Log the error for server-side debugging
    console.error('Registration error:', error);

    res.status(500).json({ 
      message: "Error registering user", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

const userLogin = async (req: Request, res: Response) => {
  const { userName, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { userName } });
    if (!user) return res.status(400).json({ message: "Invalid username or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid username or password" });

    // Generate JWT token
    const token = jwt.sign({ 
      id: user.id, 
      role: "user",
      userName: user.userName 
    }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({ 
      message: "User login successful", 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userName: user.userName
      }
    });
  } catch (error) {
    // Log the error for server-side debugging
    console.error('Login error:', error);

    res.status(500).json({ 
      message: "Error logging in", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export { userRegister, userLogin };