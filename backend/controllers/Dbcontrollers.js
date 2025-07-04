import { Client } from "pg";

export const connectionString = async (req, res) => {
  const { url } = req.body;
  try {
    const client = new Client({ connectionString: `${url}` });

    await client.connect().then(() => {
      res
        .status(200)
        .json({ message: "Connected to PostgreSQL database successfully" });
      client.end();
    });
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    return res.status(500).json({ error: "Failed to connect to the database" });
  }
};

export const createtable = async (req, res) => {
  const { url, tablename, columns } = req.body;

  if (!url || !tablename || !columns || !Array.isArray(columns)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });

    await client.connect();

    const columndef = columns
      .map((col) => `${col.name} ${col.type.toUpperCase()}`)
      .join(", ");

    const sql = `CREATE TABLE IF NOT EXISTS ${tablename} (${columndef});`;

    await client.query(sql);
    await client.end();

    res
      .status(200)
      .json({ success: true, message: `Table '${tablename}' created.` });
  } catch (error) {
    console.error("Error creating table:", error);
    return res.status(500).json({ error: "Failed to create the table" });
  }
};

export const droptable = async (req, res) => {
  const { url, tablename } = req.body;

  if (!url || !tablename) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });

    await client.connect();

    const sql = `DROP TABLE ${tablename};`;

    await client.query(sql);
    await client.end();

    res
      .status(200)
      .json({ success: true, message: `Table '${tablename}' Dropped.` });
  } catch (error) {
    console.error("Error creating table:", error);
    return res.status(500).json({ error: "Failed to drop the table" });
  }
};

export const inserttable = async (req, res) => {
  const { url, tablename, values } = req.body;

  if (!url || !tablename || !Array.isArray(values) || values.length === 0) {
    return res.status(400).json({ error: "Invalid or missing values array" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    // Extract columns from first row
    const columns = Object.keys(values[0]);

    // Build bulk values and placeholders
    const allValues = [];
    const placeholders = values.map((row, rowIndex) => {
      const rowPlaceholders = columns.map((_, colIndex) => {
        const paramIndex = rowIndex * columns.length + colIndex + 1;
        return `$${paramIndex}`;
      });
      allValues.push(...columns.map(col => row[col]));
      return `(${rowPlaceholders.join(', ')})`;
    }).join(', ');

    const query = `INSERT INTO ${tablename} (${columns.join(', ')}) VALUES ${placeholders} RETURNING *`;


    const result = await client.query(query, allValues);
    await client.end();

    res.status(200).json({
      success: true,
      message: "Rows inserted successfully",
      data: result.rows,
    });

  } catch (error) {
    console.error("Error inserting rows:", error);
    return res.status(500).json({ error: "Failed to insert rows" });
  }
};

export const readtable = async (req, res) => {
  const { url, tablename, filters, limit } = req.body;

  if (!url || !tablename) {
    return res.status(400).json({ error: "Missing database URL or table name" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    let query = `SELECT * FROM ${tablename}`;
    const values = [];

    // Optional WHERE clause
    if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map((key, i) => {
        values.push(filters[key]);
        return `${key} = $${i + 1}`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Optional LIMIT
    if (limit && Number.isInteger(limit)) {
      query += ` LIMIT ${limit}`;
    }


    const result = await client.query(query, values);
    await client.end();

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error selecting rows:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const deleteById = async (req, res) => {
  const { url, tablename, id, idColumn = 'id' } = req.body;

  if (!url || !tablename || !id) {
    return res.status(400).json({ error: "Missing required fields: url, tablename, or id" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const query = `DELETE FROM ${tablename} WHERE ${idColumn} = $1 RETURNING *`;
    const result = await client.query(query, [id]);

    await client.end();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No record found to delete." });
    }

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
      deleted: result.rows[0]
    });

  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ error: "Failed to delete record" });
  }
};


export const updateById = async (req, res) => {
  const { url, tablename, id, updates, idColumn = 'id' } = req.body;

  if (!url || !tablename || !id || !updates || typeof updates !== 'object') {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const columns = Object.keys(updates);
    const values = Object.values(updates);

    // Build SET clause
    const setClause = columns
      .map((col, idx) => `${col} = $${idx + 1}`)
      .join(', ');

    // Add ID as last parameter
    values.push(id);
    const query = `UPDATE ${tablename} SET ${setClause} WHERE ${idColumn} = $${columns.length + 1} RETURNING *`;

    const result = await client.query(query, values);
    await client.end();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No record found to update." });
    }

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      updated: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: "Failed to update record" });
  }
};