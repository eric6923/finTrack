import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import agentRoutes from "./routes/agentRoutes";
import { verifyRole } from "./middleware/authMiddleware";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Admin-specific routes
app.use("/api/admin", adminRoutes);

// Agent-specific routes
app.use("/api/agent", agentRoutes);

// Example admin route
app.get("/admin", verifyRole, (req, res) => {
  res.send("This is an admin-only routes.");
});

export default app;
