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