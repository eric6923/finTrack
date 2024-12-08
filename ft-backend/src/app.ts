import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import ownerRoutes from "./routes/ownerRoutes"

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Admin-specific routes
app.use("/api/admin", adminRoutes);

// user-specific routes
app.use("/api/user", userRoutes,ownerRoutes);


export default app;
