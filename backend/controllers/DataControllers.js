import Project from "../model/ProjectModel.js";
import { getPool } from "../lib/poolManager.js";
import { queryWithRetry } from "../lib/queryWithRetry.js";

function isValidIdentifier(name) {
  return typeof name === "string" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

async function resolveProject(req) {
  const { project } = req.params;
  const ownerId = req.user?.id;
  if (!project) throw new Error("Project identifier is required");

  const query = isValidIdentifier(project)
    ? { $or: [{ _id: project }, { name: project }], owner: ownerId }
    : { _id: project, owner: ownerId };

  const doc = await Project.findOne(query);
  if (!doc) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }
  if (!doc.connection || !doc.connection.url) {
    const err = new Error("Project has no SQL connection URL configured");
    err.status = 400;
    throw err;
  }
  return doc;
}

export const readTable = async (req, res) => {
  try {
    const project = await resolveProject(req);
    const { table } = req.params;

    if (!isValidIdentifier(table)) {
      return res.status(400).json({ error: "Invalid table name" });
    }

    const pool = getPool(project.connection.url);

    const filters = { ...req.query };
    const values = [];
    let where = "";
    const filterKeys = Object.keys(filters).filter((k) => k !== "limit");
    if (filterKeys.length > 0) {
      const clauses = [];
      filterKeys.forEach((key, idx) => {
        if (!isValidIdentifier(key)) return; // skip invalid columns silently
        clauses.push(`${key} = $${values.length + 1}`);
        values.push(filters[key]);
      });
      if (clauses.length > 0) where = ` WHERE ${clauses.join(" AND ")}`;
    }

    let limit = parseInt(filters.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0 || limit > 1000) limit = 100;

    const sql = `SELECT * FROM ${table}${where} LIMIT ${limit}`;
    const result = await queryWithRetry(pool, sql, values, { retries: 5, baseDelayMs: 150 });
    res.json({ success: true, data: result.rows });
  } catch (err) {
    const code = err.status || 500;
    console.error("readTable error:", err.message);
    res.status(code).json({ error: err.message });
  }
};

export const insertRows = async (req, res) => {
  try {
    const project = await resolveProject(req);
    const { table } = req.params;
    const body = req.body;
    const rows = Array.isArray(body) ? body : body?.values || [];
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table name" });
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "Values array required" });

    const pool = getPool(project.connection.url);
    const columns = Object.keys(rows[0]);
    const allValues = [];
    const placeholders = rows
      .map((row, rowIndex) => {
        const rowPlaceholders = columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`);
        allValues.push(...columns.map((c) => row[c]));
        return `(${rowPlaceholders.join(", ")})`;
      })
      .join(", ");

    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders} RETURNING *`;
    const result = await pool.query(sql, allValues);
    res.status(201).json({ success: true, data: result.rows });
  } catch (err) {
    const code = err.status || 500;
    console.error("insertRows error:", err.message);
    res.status(code).json({ error: err.message });
  }
};

export const updateRow = async (req, res) => {
  try {
    const project = await resolveProject(req);
    const { table, id } = req.params;
    const updates = req.body || {};
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table name" });
    if (!id || typeof updates !== "object") return res.status(400).json({ error: "Invalid payload" });

    const pool = getPool(project.connection.url);
    const columns = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");
    values.push(id);
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    const code = err.status || 500;
    console.error("updateRow error:", err.message);
    res.status(code).json({ error: err.message });
  }
};

export const deleteRow = async (req, res) => {
  try {
    const project = await resolveProject(req);
    const { table, id } = req.params;
    if (!isValidIdentifier(table)) return res.status(400).json({ error: "Invalid table name" });
    if (!id) return res.status(400).json({ error: "id required" });
    const pool = getPool(project.connection.url);
    const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query(sql, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    const code = err.status || 500;
    console.error("deleteRow error:", err.message);
    res.status(code).json({ error: err.message });
  }
};


