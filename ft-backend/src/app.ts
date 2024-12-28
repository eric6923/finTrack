import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import ownerRoutes from "./routes/ownerRoutes"

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'https://your-production-frontend-url.com'], // Add your production URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes,ownerRoutes);  // Separate these into two lines


// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'CORS is working!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

export default app;