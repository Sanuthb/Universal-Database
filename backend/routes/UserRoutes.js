import express from "express";
import { register,login,addConnection, getOrCreateApiKey } from "../controllers/UserControllers.js";
import { authMiddleware } from "../middleware/Usermiddleware.js";

const userRouter = express.Router();

userRouter.post("/register",register)
userRouter.post("/login",login)
userRouter.post("/add-connection",authMiddleware,addConnection)
userRouter.get("/api-key",authMiddleware,getOrCreateApiKey)

export default userRouter;