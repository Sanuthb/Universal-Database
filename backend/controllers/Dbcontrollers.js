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
  const { url, tablename, idColumn = 'id' } = req.body;
  const { id } = req.params;

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

// Enhanced table creation with foreign key support
export const createTableWithConstraints = async (req, res) => {
  const { url, tablename, columns, foreignKeys } = req.body;

  if (!url || !tablename || !columns || !Array.isArray(columns)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    // Build column definitions
    const columnDefs = columns.map((col) => {
      let def = `${col.name} ${col.type.toUpperCase()}`;
      
      if (col.notNull) {
        def += ' NOT NULL';
      }
      
      if (col.defaultValue !== undefined && col.defaultValue !== '') {
        def += ` DEFAULT ${col.defaultValue}`;
      }
      
      return def;
    });

    // Build foreign key constraints
    const fkConstraints = [];
    if (foreignKeys && Array.isArray(foreignKeys)) {
      foreignKeys.forEach((fk, index) => {
        if (fk.column && fk.referenceTable && fk.referenceColumn) {
          fkConstraints.push(
            `CONSTRAINT fk_${tablename}_${fk.column}_${index} FOREIGN KEY (${fk.column}) REFERENCES ${fk.referenceTable}(${fk.referenceColumn})`
          );
        }
      });
    }

    // Combine all definitions
    const allDefs = [...columnDefs, ...fkConstraints];
    const sql = `CREATE TABLE IF NOT EXISTS ${tablename} (${allDefs.join(', ')});`;

    await client.query(sql);
    await client.end();

    res.status(200).json({ 
      success: true, 
      message: `Table '${tablename}' created with constraints.` 
    });
  } catch (error) {
    console.error("Error creating table with constraints:", error);
    return res.status(500).json({ error: "Failed to create the table" });
  }
};

// Get database schema information
export const getDatabaseSchema = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Database URL is required" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    // Get all tables
    const tablesQuery = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const tablesResult = await client.query(tablesQuery);

    // Get columns for each table
    const tablesWithColumns = await Promise.all(
      tablesResult.rows.map(async (table) => {
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        const columnsResult = await client.query(columnsQuery, [table.table_name]);

        // Get foreign key information
        const fkQuery = `
          SELECT 
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
          FROM information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = $1
        `;
        const fkResult = await client.query(fkQuery, [table.table_name]);

        return {
          name: table.table_name,
          type: table.table_type,
          columns: columnsResult.rows.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            defaultValue: col.column_default,
            maxLength: col.character_maximum_length,
            precision: col.numeric_precision,
            scale: col.numeric_scale
          })),
          foreignKeys: fkResult.rows.map(fk => ({
            column: fk.column_name,
            referenceTable: fk.foreign_table_name,
            referenceColumn: fk.foreign_column_name,
            constraintName: fk.constraint_name
          }))
        };
      })
    );

    await client.end();

    res.status(200).json({
      success: true,
      data: tablesWithColumns
    });

  } catch (error) {
    console.error("Error fetching database schema:", error);
    res.status(500).json({ error: "Failed to fetch database schema" });
  }
};

// Add column to existing table
export const addColumn = async (req, res) => {
  const { url, tablename, column } = req.body;

  if (!url || !tablename || !column || !column.name || !column.type) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    let columnDef = `${column.name} ${column.type.toUpperCase()}`;
    
    if (column.notNull) {
      columnDef += ' NOT NULL';
    }
    
    if (column.defaultValue !== undefined && column.defaultValue !== '') {
      columnDef += ` DEFAULT ${column.defaultValue}`;
    }

    const sql = `ALTER TABLE ${tablename} ADD COLUMN ${columnDef};`;
    await client.query(sql);
    await client.end();

    res.status(200).json({
      success: true,
      message: `Column '${column.name}' added to table '${tablename}'.`
    });

  } catch (error) {
    console.error("Error adding column:", error);
    return res.status(500).json({ error: "Failed to add column" });
  }
};

// Drop column from table
export const dropColumn = async (req, res) => {
  const { url, tablename, columnName } = req.body;

  if (!url || !tablename || !columnName) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const sql = `ALTER TABLE ${tablename} DROP COLUMN ${columnName};`;
    await client.query(sql);
    await client.end();

    res.status(200).json({
      success: true,
      message: `Column '${columnName}' dropped from table '${tablename}'.`
    });

  } catch (error) {
    console.error("Error dropping column:", error);
    return res.status(500).json({ error: "Failed to drop column" });
  }
};

// Add foreign key constraint
export const addForeignKey = async (req, res) => {
  const { url, tablename, column, referenceTable, referenceColumn, constraintName } = req.body;

  if (!url || !tablename || !column || !referenceTable || !referenceColumn) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const constraintNameFinal = constraintName || `fk_${tablename}_${column}`;
    const sql = `ALTER TABLE ${tablename} ADD CONSTRAINT ${constraintNameFinal} FOREIGN KEY (${column}) REFERENCES ${referenceTable}(${referenceColumn});`;
    
    await client.query(sql);
    await client.end();

    res.status(200).json({
      success: true,
      message: `Foreign key constraint added to table '${tablename}'.`
    });

  } catch (error) {
    console.error("Error adding foreign key:", error);
    return res.status(500).json({ error: "Failed to add foreign key constraint" });
  }
};

// Drop foreign key constraint
export const dropForeignKey = async (req, res) => {
  const { url, tablename, constraintName } = req.body;

  if (!url || !tablename || !constraintName) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const sql = `ALTER TABLE ${tablename} DROP CONSTRAINT ${constraintName};`;
    await client.query(sql);
    await client.end();

    res.status(200).json({
      success: true,
      message: `Foreign key constraint '${constraintName}' dropped from table '${tablename}'.`
    });

  } catch (error) {
    console.error("Error dropping foreign key:", error);
    return res.status(500).json({ error: "Failed to drop foreign key constraint" });
  }
};