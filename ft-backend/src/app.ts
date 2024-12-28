import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import ownerRoutes from "./routes/ownerRoutes";

const app = express();
const allowedOrigin = 'https://fin-track-nine-snowy.vercel.app';


// CORS configuration
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.options('*', (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes,ownerRoutes);  // Separated user routes


// Test route
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'CORS is working!' });
});

// Error handling middleware
interface CustomError extends Error {
    status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler - place this after all other routes
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

export default app;