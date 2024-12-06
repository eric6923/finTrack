import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const verifyUser: (req: CustomRequest, res: Response, next: NextFunction) => void = (
  req,
  res,
  next
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the authorization header
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };

    if (decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied. User role required" });
    }

    req.user = { id: decoded.id, role: decoded.role }; // Attach both user ID and role to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export { verifyUser };
