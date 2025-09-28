import { DatabaseAdapter } from '../DatabaseAdapter.js';
import { getPool } from '../poolManager.js';
import { queryWithRetry } from '../queryWithRetry.js';

export class PostgreSQLAdapter extends DatabaseAdapter {
  constructor(connectionString) {
    super(connectionString);
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = getPool(this.connectionString);
      const client = await this.pool.connect();
      client.release();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
    }
  }

  async testConnection() {
    try {
      const pool = getPool(this.connectionString);
      const client = await pool.connect();
      client.release();
      return true;
    } catch (error) {
      console.error('PostgreSQL test connection failed:', error);
      return false;
    }
  }

  async createTable(tableName, columns, foreignKeys = []) {
    if (!this.pool) await this.connect();

    try {
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
            const constraintName = fk.constraintName || `fk_${tableName}_${fk.column}_${index}`;
            fkConstraints.push(
              `CONSTRAINT ${constraintName} FOREIGN KEY (${fk.column}) REFERENCES ${fk.referenceTable}(${fk.referenceColumn})`
            );
          }
        });
      }

      // Combine all definitions
      const allDefs = [...columnDefs, ...fkConstraints];
      const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${allDefs.join(', ')});`;

      await this.pool.query(sql);
      return { success: true, message: `Table '${tableName}' created successfully.` };
    } catch (error) {
      console.error('Error creating PostgreSQL table:', error);
      throw error;
    }
  }

  async dropTable(tableName) {
    if (!this.pool) await this.connect();

    try {
      const sql = `DROP TABLE IF EXISTS ${tableName};`;
      await this.pool.query(sql);
      return { success: true, message: `Table '${tableName}' dropped successfully.` };
    } catch (error) {
      console.error('Error dropping PostgreSQL table:', error);
      throw error;
    }
  }

  async insert(tableName, data) {
    if (!this.pool) await this.connect();

    try {
      const values = Array.isArray(data) ? data : [data];
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

      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders} RETURNING *`;
      const result = await this.pool.query(query, allValues);

      return {
        success: true,
        data: result.rows,
        message: "Data inserted successfully"
      };
    } catch (error) {
      console.error('Error inserting into PostgreSQL:', error);
      throw error;
    }
  }

  async read(tableName, filters = {}, limit = null) {
    if (!this.pool) await this.connect();

    try {
      let query = `SELECT * FROM ${tableName}`;
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

      const result = await queryWithRetry(this.pool, query, values, { retries: 5, baseDelayMs: 150 });

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      console.error('Error reading from PostgreSQL:', error);
      throw error;
    }
  }

  async update(tableName, id, updates, idColumn = 'id') {
    if (!this.pool) await this.connect();

    try {
      const columns = Object.keys(updates);
      const values = Object.values(updates);

      // Build SET clause
      const setClause = columns
        .map((col, idx) => `${col} = $${idx + 1}`)
        .join(', ');

      // Add ID as last parameter
      values.push(id);
      const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = $${columns.length + 1} RETURNING *`;

      const result = await this.pool.query(query, values);

      if (result.rowCount === 0) {
        return { success: false, message: "No record found to update." };
      }

      return {
        success: true,
        data: result.rows[0],
        message: "Record updated successfully"
      };
    } catch (error) {
      console.error('Error updating PostgreSQL record:', error);
      throw error;
    }
  }

  async delete(tableName, id, idColumn = 'id') {
    if (!this.pool) await this.connect();

    try {
      const query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING *`;
      const result = await this.pool.query(query, [id]);

      if (result.rowCount === 0) {
        return { success: false, message: "No record found to delete." };
      }

      return {
        success: true,
        data: result.rows[0],
        message: "Record deleted successfully"
      };
    } catch (error) {
      console.error('Error deleting PostgreSQL record:', error);
      throw error;
    }
  }

  async getSchema() {
    if (!this.pool) await this.connect();

    try {
      // Get all tables
      const tablesQuery = `
        SELECT 
          table_name,
          table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      const tablesResult = await this.pool.query(tablesQuery);

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
          const columnsResult = await this.pool.query(columnsQuery, [table.table_name]);

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
          const fkResult = await this.pool.query(fkQuery, [table.table_name]);

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

      return {
        success: true,
        data: tablesWithColumns
      };
    } catch (error) {
      console.error('Error fetching PostgreSQL schema:', error);
      throw error;
    }
  }

  async addColumn(tableName, column) {
    if (!this.pool) await this.connect();

    try {
      let columnDef = `${column.name} ${column.type.toUpperCase()}`;
      
      if (column.notNull) {
        columnDef += ' NOT NULL';
      }
      
      if (column.defaultValue !== undefined && column.defaultValue !== '') {
        columnDef += ` DEFAULT ${column.defaultValue}`;
      }

      const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnDef};`;
      await this.pool.query(sql);

      return {
        success: true,
        message: `Column '${column.name}' added to table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error adding PostgreSQL column:', error);
      throw error;
    }
  }

  async dropColumn(tableName, columnName) {
    if (!this.pool) await this.connect();

    try {
      const sql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`;
      await this.pool.query(sql);

      return {
        success: true,
        message: `Column '${columnName}' dropped from table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error dropping PostgreSQL column:', error);
      throw error;
    }
  }

  async addForeignKey(tableName, column, referenceTable, referenceColumn, constraintName) {
    if (!this.pool) await this.connect();

    try {
      const constraintNameFinal = constraintName || `fk_${tableName}_${column}`;
      const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintNameFinal} FOREIGN KEY (${column}) REFERENCES ${referenceTable}(${referenceColumn});`;
      
      await this.pool.query(sql);

      return {
        success: true,
        message: `Foreign key constraint added to table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error adding PostgreSQL foreign key:', error);
      throw error;
    }
  }

  async dropForeignKey(tableName, constraintName) {
    if (!this.pool) await this.connect();

    try {
      const sql = `ALTER TABLE ${tableName} DROP CONSTRAINT ${constraintName};`;
      await this.pool.query(sql);

      return {
        success: true,
        message: `Foreign key constraint '${constraintName}' dropped from table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error dropping PostgreSQL foreign key:', error);
      throw error;
    }
  }
}