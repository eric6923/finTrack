import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import agentRoutes from "./routes/userRoutes";
import { verifyRole } from "./middleware/authMiddleware";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Admin-specific routes
app.use("/api/admin", adminRoutes);

// Agent-specific routes
app.use("/api/user", agentRoutes);


export default app;
