import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/client";

export const getAllPendingUsers = async (req: Request, res: Response) => {
    try {
      const pendingUsers = await prisma.pendingUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          userName: true,
          aadhar:true,
          pan:true,
          gstin:true,
          address:true,
          phone: true,
          createdAt: true
        }
      });
  
      res.status(200).json({ 
        message: "Pending users retrieved successfully", 
        pendingUsers 
      });
    } catch (error) {
      console.error('Retrieve pending users error:', error);
      res.status(500).json({ 
        message: "Error retrieving pending users", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
  };
  }
export const getAllUsers = async (req: Request, res: Response) => {
    try {
      const Users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          userName: true,
          aadhar:true,
          pan:true,
          gstin:true,
          address:true,
          phone: true,
          createdAt: true
        }
      });
  
      res.status(200).json({ 
        message: " users retrieved successfully", 
        Users 
      });
    } catch (error) {
      console.error('Retrieve  users error:', error);
      res.status(500).json({ 
        message: "Error retrieving  users", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
  };
  }

export const rejectPendingUser = async (req: Request, res: Response) => {
    const { pendingUserId } = req.params;
  
    try {
      await prisma.pendingUser.delete({
        where: { id: parseInt(pendingUserId) }
      });
  
      res.status(200).json({ 
        message: "Pending user registration rejected and deleted" 
      });
    } catch (error) {
      console.error('Reject pending user error:', error);
      res.status(500).json({ 
        message: "Error rejecting pending user", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
  };
}

export const submitPaymentVerification = async (req: Request, res: Response) => {
    const { 
      amount, 
      paymentMethod,
      upiTransactionId 
    } = req.body;

    const { pendingUserId } = req.params;
  
    // Validate input
    if (!pendingUserId) {
      return res.status(400).json({ message: "Pending User ID is required" });
    }
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }
  
    if (paymentMethod === 'UPI' && !upiTransactionId) {
      return res.status(400).json({ message: "UPI Transaction ID is required for UPI payments" });
    }
  
    try {
      // Check if pending user exists
      const pendingUser = await prisma.pendingUser.findUnique({
        where: { id: parseInt(pendingUserId) }
      });
  
      if (!pendingUser) {
        return res.status(404).json({ message: "Pending user not found" });
      }
  
      // Check if payment verification already exists
      const existingPaymentVerification = await prisma.paymentVerification.findUnique({
        where: { pendingUserId: parseInt(pendingUserId) }
      });
  
      if (existingPaymentVerification) {
        // Update existing payment verification
        const updatedPaymentVerification = await prisma.paymentVerification.update({
          where: { pendingUserId: parseInt(pendingUserId) },
          data: {
            amount: parseFloat(amount.toString()),
            paymentMethod,
            upiTransactionId: paymentMethod === 'UPI' ? upiTransactionId : null,
            isVerified: true, // Automatically set to verified
          }
        });
  
        return res.status(200).json({ 
          message: "Payment verification updated", 
          paymentVerification: updatedPaymentVerification 
        });
      }
  
      // Create new payment verification
      const paymentVerification = await prisma.paymentVerification.create({
        data: {
          pendingUserId: parseInt(pendingUserId),
          amount: parseFloat(amount.toString()),
          paymentMethod,
          upiTransactionId: paymentMethod === 'UPI' ? upiTransactionId : null,
          isVerified: true, // Automatically set to verified
        }
      });
  
      res.status(201).json({ 
        message: "Payment verification submitted", 
        paymentVerification 
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        message: "Error submitting payment verification", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
};

// Approve User
export const verifyPaymentAndApproveUser = async (req: Request, res: Response) => {
    const { pendingUserId } = req.params;
  
    try {
      const pendingUserIdInt = parseInt(pendingUserId);
  
      // Validate the pending user ID
      if (isNaN(pendingUserIdInt)) {
        return res.status(400).json({ message: "Invalid Pending User ID" });
      }
  
      // Check if the pending user exists
      const pendingUser = await prisma.pendingUser.findUnique({
        where: { id: pendingUserIdInt },
      });
  
      if (!pendingUser) {
        return res.status(404).json({ message: "Pending user not found" });
      }
  
      // Check if payment verification exists
      const paymentVerification = await prisma.paymentVerification.findUnique({
        where: { pendingUserId: pendingUserIdInt },
      });
  
      if (!paymentVerification) {
        return res.status(404).json({ 
          message: "Payment verification record not found for this pending user", 
          debug: { pendingUserIdInt } 
        });
      }
  
      // Begin transaction
      const approvedUser = await prisma.$transaction(async (prisma) => {
        // Create user in the main user table
        const newUser = await prisma.user.create({
          data: {
            name: pendingUser.name,
            email: pendingUser.email,
            userName: pendingUser.userName,
            password: pendingUser.password,
            phone: pendingUser.phone,
            gstin: pendingUser.gstin,
            aadhar: pendingUser.aadhar,
            pan: pendingUser.pan,
          },
        });
  
        // Delete the pending user record
        await prisma.pendingUser.delete({
          where: { id: pendingUserIdInt },
        });
  
        // Delete the payment verification record
        // await prisma.paymentVerification.delete({
        //   where: { pendingUserId: pendingUserIdInt }, // Key match explicitly here
        // });
  
        return newUser;
      });
  
      // Remove sensitive data before response
      const { password, ...userResponse } = approvedUser;
  
      res.status(200).json({
        message: "User approved and activated successfully",
        user: userResponse,
      });
    } catch (error) {
      // Handle Prisma errors gracefully
    //   if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    //     return res.status(404).json({
    //       message: "Record not found during delete operation",
    //       debug: { pendingUserId },
    //     });
    //   }
  
      // Catch-all for other errors
      console.error("User approval error:", error);
      res.status(500).json({
        message: "Error approving user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  