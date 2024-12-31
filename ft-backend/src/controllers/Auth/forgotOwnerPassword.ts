import crypto from "crypto";
import { sendEmail } from "../../utils/email"; // Utility function for sending emails
import prisma from "../../../prisma/client";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const forgotOwnerPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
  
    try {
      // Check if the user exists and has an associated OwnerPassword
      const user = await prisma.user.findUnique({
        where: { email },
        include: { ownerPassword: true },
      });
  
      if (!user || !user.ownerPassword) {
        return res.status(404).json({ error: "Owner account not found" });
      }
  
      // Generate reset token and expiry
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // Token valid for 1 hour
  
      // Update the user with the reset token and expiry
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
  
      // Construct reset link
      const resetLink = `${process.env.FRONTEND_URL}/reset-owner-password?token=${resetToken}`;
  
      // Use the sendEmail utility
      await sendEmail(
        email,
        "Reset Your Owner Password",
        `
        Hi ${user.name},
        
        You requested to reset your owner password. Click the link below to reset it:
        ${resetLink}
        
        If you didn’t request this, you can ignore this email.
        `
      );
  
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Error during forgot owner password:", error);
      res.status(500).json({ error: "Failed to send reset email" });
    }
  };
  

  export const resetOwnerPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
  
    try {
      // Find user by reset token
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gte: new Date(), // Ensure token is still valid
          },
        },
      });
  
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the OwnerPassword and clear the resetToken fields
      await prisma.$transaction([
        prisma.ownerPassword.update({
          where: { userId: user.id },
          data: { password: hashedPassword },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: null,
            resetTokenExpiry: null,
          },
        }),
      ]);
  
      res.status(200).json({ message: "Owner password reset successfully" });
    } catch (error) {
      console.error("Error during password reset:", error);
      res.status(500).json({ error: "Failed to reset owner password" });
    }
  };