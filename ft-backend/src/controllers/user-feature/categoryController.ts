import { Request, Response } from 'express';
import prisma from "../../../prisma/client";

interface CustomRequest extends Request {
  user?: {
    id: string; // User ID from the token
    role: string; // User role, e.g., "user" or "admin"
  };
}

// Create a new category
export const createCategory = async (req: CustomRequest, res: Response) => {
  let { name } = req.body;

  try {
    // Ensure userId is available and is a number
    const userId = req.user?.id ? Number(req.user.id) : null;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Convert the category name to uppercase
    name = name.toUpperCase();

    // Check if the category already exists for this user by name and createdBy
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name,
        createdBy: userId,  // Ensure the category is unique to the user
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists for this user" });
    }

    // Create the category with the userId as the createdBy field
    const category = await prisma.category.create({
      data: {
        name,
        createdBy: userId, // Store the userId of the user who created the category
      },
    });

    res.status(201).json(category); // Return the created category
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating category" });
  }
};


// Get categories by user
export const getCategoriesByUser = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { createdBy: userId }, // Use the userId from the token
    });

    res.status(200).json(categories); // Return all categories created by the user
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const deleteCategory = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null;
  const categoryId = req.params.id ? Number(req.params.id) : null; // Get category ID from request params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!categoryId) {
    return res.status(400).json({ message: "Category ID is required" });
  }

  try {
    // Check if the category exists and belongs to the user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        createdBy: userId,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found or does not belong to the user" });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting category" });
  }
};