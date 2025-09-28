import express from "express";
import { authMiddleware } from "../middleware/Usermiddleware.js";
import { readTable, insertRows, updateRow, deleteRow } from "../controllers/DataControllers.js";

const dataRouter = express.Router();

// All endpoints require auth; they map to a project's connection URL
dataRouter.use(authMiddleware);

// GET /api/v1/data/:project/:table?col=value&limit=100
dataRouter.get("/:project/:table", readTable);

// POST /api/v1/data/:project/:table
// Body: { values: [{...}, {...}] } or [ {..}, {..} ]
dataRouter.post("/:project/:table", insertRows);

// PATCH /api/v1/data/:project/:table/:id
dataRouter.patch("/:project/:table/:id", updateRow);

// DELETE /api/v1/data/:project/:table/:id
dataRouter.delete("/:project/:table/:id", deleteRow);

export default dataRouter;


