import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbrouter from "./routes/Dbroutes.js";
import projectRouter from "./routes/ProjectRoutes.js";
import dataRouter from "./routes/DataRoutes.js";
import publicDataRouter from "./routes/PublicDataRoutes.js";
import ConnectDB from "./config/db.js";
import userRouter from "./routes/UserRoutes.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Database connection routes
app.use("/api/v1/db", dbrouter);
// Project routes (auth required)
app.use("/api/v1/projects", projectRouter);
// Data access routes for per-project tables
app.use("/api/v1/data", dataRouter);
app.use("/api/v1/user",userRouter);
// Public API-key based routes (keep last to avoid intercepting API routes)
app.use("/", publicDataRouter);


app.listen(process.env.PORT || 9000, () => {
ConnectDB();
  console.log(`Server is running on port ${process.env.PORT || 9000}`);
});
