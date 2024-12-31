import crypto from "crypto";
import { sendEmail } from "../../utils/email"; // Utility function for sending emails
import prisma from "../../../prisma/client";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {z} from 'zod';


export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set the token and expiry in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      },
    });

    // Send the reset link via email
    const resetLink = `${process.env.FRONTEND_URL}?token=${resetToken}`;
    await sendEmail(user.email, "Password Reset Request", `Click this link to reset your password: ${resetLink}`);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error processing password reset request" });
  }
};



const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long")
});

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Get token from either query parameters or URL parameters
    const token = req.query.token || req.params.token;
    const { newPassword } = req.body;

    // Validate input
    const result = resetPasswordSchema.safeParse({
      token,
      newPassword
    });

    if (!result.success) {
      return res.status(400).json({ 
        message: "Invalid input", 
        errors: result.error.errors 
      });
    }

    const validatedData = result.data;

    // Hash the provided token to match the stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(validatedData.token)
      .digest("hex");

    // Find the user with the reset token and ensure it's not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { 
          gte: new Date(),
          not: null // Ensure resetTokenExpiry exists
        },
      },
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired password reset token" 
      });
    }

    // Prevent reuse of the same password
    const isSamePassword = await bcrypt.compare(validatedData.newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: "New password must be different from the current password" 
      });
    }

    // Hash the new password with a cost factor of 12
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update the user's password and clear the reset token in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        },
      });
    });

    res.status(200).json({ 
      message: "Password has been reset successfully" 
    });
    
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ 
      message: "An error occurred while resetting your password" 
    });
  }
};