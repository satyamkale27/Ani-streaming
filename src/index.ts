import express, { Request, Response } from "express";
import { NODE_ENV, PORT, MONGO_URI } from "./helpers/envConfig.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import connectDb from "./helpers/connectDb.js";
import compression from "compression";
import { errorMiddleware } from "./middlewares/errors/errorMiddleware.js";
import redisClient from "./helpers/redisClient.js";
import asyncHandler from "./middlewares/tryCatch.js";

// Allowed origins for CORS
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDb(MONGO_URI); // Pass your MongoDB URI here

// Middlewares
app.use(helmet()); // Security headers

// Logging based on environment (development/production)
const logFormat = NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(logFormat));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies to be sent
  })
);

// Routes
app.get("/", (_, res) => {
  res.send("Server is running!");
});

app.get("/api/data", (_, res) => {
  res.status(200).json({ message: "Data from the server" });
});

function yourDbQuery() {
    console.log("DO SOME TASK HERE (LIKE DB QUERY)");
}

// Redis Cache-based route
app.get("/api/route", asyncHandler(async (_:Request, res:Response) => {
    // Step 1: Check if the data is already in the cache
    const cachedData = await redisClient.get("yourCacheKey");
  
    if (cachedData) {
      // Step 2: If cache is found, serve data from cache
      console.log("Data served from cache");
      return res.status(200).json({ message: "Data from cache", data: JSON.parse(cachedData) });
    }
  
    // Step 3: If cache is missed, perform the actual DB query or heavy operation
    const data = await yourDbQuery();
  
    // Step 4: Store the freshly fetched/generated data in the cache (with an expiration time)
    redisClient.set("yourCacheKey", JSON.stringify(data), "EX", 60); // Cache for 60 seconds
  
    // Step 5: Serve the freshly generated data to the client
    console.log("Data served from the server");
    return res.status(200).json({ message: "Data from the server", data });
  }));

// 404 Handler for non-existent routes (must come after routes)
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handling Middleware (must come after routes and 404 handler)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
