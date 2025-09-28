import express from "express";
import { authMiddleware } from "../middleware/Usermiddleware.js";
import { createProject, listProjects, getProject, deleteProject } from "../controllers/ProjectControllers.js";

const projectRouter = express.Router();

projectRouter.use(authMiddleware);

projectRouter.post("/", createProject);
projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.delete("/:id", deleteProject);

export default projectRouter;


