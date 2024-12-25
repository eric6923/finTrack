import crypto from "crypto";
import { sendEmail } from "../../utils/email"; // Utility function for sending emails
import prisma from "../../../prisma/client";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";


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
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(user.email, "Password Reset Request", `Click this link to reset your password: ${resetLink}`);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error processing password reset request" });
  }
};



export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
  
    try {
      // Hash the provided token to match the stored hash
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
      // Find the user with the reset token and ensure it's not expired
      const user = await prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: { gte: new Date() }, // Token not expired
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password and clear the reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  };
  