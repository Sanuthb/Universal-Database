import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbrouter from "./routes/Dbroutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Database connnection routes
app.use("/api/v1/db",dbrouter);
//Database CRUD routes 
app.use("/api/v1/dDCRUD",dbrouter)


app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT || 9000}`);
});
