import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import ownerRoutes from "./routes/ownerRoutes"

const app = express();

app.use(
    cors({
      origin: 'http://localhost:5173', // Your frontend's development URL
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
      credentials: true, // Include credentials like cookies if needed
    })
  );app.use(bodyParser.json());

// Admin-specific routes
app.use("/api/admin", adminRoutes);

// user-specific routes
app.use("/api/user", userRoutes,ownerRoutes);

app.get('/api/test', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*'); // Test response
    res.json({ message: 'CORS is working!' });
  });


export default app;
