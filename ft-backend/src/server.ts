import app from "./app";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use(
  cors({
    origin: 'http://localhost:5173', // Your frontend's development URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    credentials: true, // Include credentials like cookies if needed
  })
);