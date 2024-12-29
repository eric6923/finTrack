import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import ownerRoutes from "./routes/ownerRoutes"

const app = express();

// CORS configuration
app.use(
    cors({
      origin: ['http://localhost:5173', 'https://fintrackfe.vercel.app/'], // Update this with your frontend URLs
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true, // Allows cookies and authorization headers
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
      ],
    })
  );
  

  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept'
    );
    res.sendStatus(200);
  });
  

  

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