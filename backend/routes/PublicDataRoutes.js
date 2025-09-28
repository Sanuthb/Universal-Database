import express from "express";
import { apiKeyMiddleware } from "../middleware/ApiKeyMiddleware.js";
import Project from "../model/ProjectModel.js";
import { getPool } from "../lib/poolManager.js";
import { queryWithRetry } from "../lib/queryWithRetry.js";
import mongoose from "mongoose";

function isValidIdentifier(name) {
  return typeof name === "string" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

const router = express.Router();

router.use("/:apikey/:project", apiKeyMiddleware);

router.get("/:apikey/:project/:table", async (req, res) => {
  try {
    const { project, table } = req.params;
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table" });

    const owner = req.apiUser._id;
    const query = mongoose.Types.ObjectId.isValid(project)
      ? { owner, _id: project }
      : { owner, name: project };
    const doc = await Project.findOne(query);
    if (!doc) return res.status(404).json({ error: "Project not found" });
    const pool = getPool(doc.connection.url);

    const filters = { ...req.query };
    const values = [];
    let where = "";
    const keys = Object.keys(filters).filter((k) => k !== "limit");
    const clauses = [];
    keys.forEach((k) => {
      if (!isValidIdentifier(k)) return;
      clauses.push(`${k} = $${values.length + 1}`);
      values.push(filters[k]);
    });
    if (clauses.length > 0) where = ` WHERE ${clauses.join(" AND ")}`;
    let limit = parseInt(filters.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0 || limit > 1000) limit = 100;

    const sql = `SELECT * FROM ${table}${where} LIMIT ${limit}`;
    const result = await queryWithRetry(pool, sql, values, { retries: 5, baseDelayMs: 150 });
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:apikey/:project/:table", async (req, res) => {
  try {
    const { project, table } = req.params;
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table" });
    const owner = req.apiUser._id;
    const query = mongoose.Types.ObjectId.isValid(project)
      ? { owner, _id: project }
      : { owner, name: project };
    const doc = await Project.findOne(query);
    if (!doc) return res.status(404).json({ error: "Project not found" });
    const pool = getPool(doc.connection.url);

    const rows = Array.isArray(req.body) ? req.body : req.body?.values || [];
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "Values array required" });
    const columns = Object.keys(rows[0]);
    const allValues = [];
    const placeholders = rows.map((row, i) => {
      const rowPlaceholders = columns.map((_, j) => `$${i * columns.length + j + 1}`);
      allValues.push(...columns.map((c) => row[c]));
      return `(${rowPlaceholders.join(", ")})`;
    }).join(", ");
    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders} RETURNING *`;
    const result = await pool.query(sql, allValues);
    res.status(201).json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:apikey/:project/:table/:id", async (req, res) => {
  try {
    const { project, table, id } = req.params;
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table" });
    const owner = req.apiUser._id;
    const query = mongoose.Types.ObjectId.isValid(project)
      ? { owner, _id: project }
      : { owner, name: project };
    const doc = await Project.findOne(query);
    if (!doc) return res.status(404).json({ error: "Project not found" });
    const pool = getPool(doc.connection.url);
    const updates = req.body || {};
    const cols = Object.keys(updates);
    const vals = Object.values(updates);
    vals.push(id);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`;
    const result = await pool.query(sql, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:apikey/:project/:table/:id", async (req, res) => {
  try {
    const { project, table, id } = req.params;
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table" });
    const owner = req.apiUser._id;
    const query = mongoose.Types.ObjectId.isValid(project)
      ? { owner, _id: project }
      : { owner, name: project };
    const doc = await Project.findOne(query);
    if (!doc) return res.status(404).json({ error: "Project not found" });
    const pool = getPool(doc.connection.url);
    const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query(sql, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


