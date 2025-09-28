import { DatabaseAdapterFactory } from "../lib/DatabaseAdapterFactory.js";

export const connectionString = async (req, res) => {
  const { url } = req.body;
  try {
    console.log('Testing connection to:', url);
    const isValid = await DatabaseAdapterFactory.testConnection(url);
    if (isValid) {
      const dbType = DatabaseAdapterFactory.getDatabaseType(url);
      console.log(`Successfully connected to ${dbType} database`);
      res.status(200).json({ 
        message: `Connected to ${dbType} database successfully`,
        type: dbType
      });
    } else {
      console.error('Connection test failed for:', url);
      res.status(500).json({ error: "Failed to connect to the database" });
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
    console.error("Connection URL:", url);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(500).json({ error: "Failed to connect to the database" });
  }
};

export const createtable = async (req, res) => {
  const { url, tablename, columns } = req.body;

  if (!url || !tablename || !columns || !Array.isArray(columns)) {
    console.error('Invalid request body for createtable:', { url: !!url, tablename, columns: Array.isArray(columns) });
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    console.log(`Creating table '${tablename}' with ${columns.length} columns`);
    console.log('Database URL:', url);
    console.log('Columns:', columns);
    
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.createTable(tablename, columns);
    
    console.log('Table creation result:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating table:", error);
    console.error("Table creation details:", {
      tablename,
      url,
      columns,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
    return res.status(500).json({ error: "Failed to create the table" });
  }
};

export const droptable = async (req, res) => {
  const { url, tablename } = req.body;

  if (!url || !tablename) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.dropTable(tablename);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error dropping table:", error);
    return res.status(500).json({ error: "Failed to drop the table" });
  }
};

export const inserttable = async (req, res) => {
  const { url, tablename, values } = req.body;

  if (!url || !tablename || !Array.isArray(values) || values.length === 0) {
    return res.status(400).json({ error: "Invalid or missing values array" });
  }

  try {
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.insert(tablename, values);
    
    res.status(200).json(result);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.read(tablename, filters, limit);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error reading rows:", error);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.delete(tablename, id, idColumn);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.update(tablename, id, updates, idColumn);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.createTable(tablename, columns, foreignKeys);
    
    res.status(200).json(result);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.getSchema();
    
    res.status(200).json(result);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.addColumn(tablename, column);
    
    res.status(200).json(result);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.dropColumn(tablename, columnName);
    
    res.status(200).json(result);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.addForeignKey(tablename, column, referenceTable, referenceColumn, constraintName);
    
    res.status(200).json(result);
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
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    const result = await adapter.dropForeignKey(tablename, constraintName);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error dropping foreign key:", error);
    return res.status(500).json({ error: "Failed to drop foreign key constraint" });
  }
};

// Get supported database types
export const getSupportedDatabases = async (req, res) => {
  try {
    const supportedTypes = DatabaseAdapterFactory.getSupportedTypes();
    const examples = DatabaseAdapterFactory.getConnectionStringExamples();
    
    res.status(200).json({
      success: true,
      supportedTypes,
      examples
    });
  } catch (error) {
    console.error("Error getting supported databases:", error);
    res.status(500).json({ error: "Failed to get supported databases" });
  }
};

// Get database adapter statistics
export const getDatabaseStats = async (req, res) => {
  try {
    const stats = DatabaseAdapterFactory.getStatistics();
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error getting database stats:", error);
    res.status(500).json({ error: "Failed to get database statistics" });
  }
};

// Test Firebase connection and basic read capability
export const testFirebaseConnection = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Database URL is required" });
  }

  try {
    console.log('Testing Firebase connection with URL:', url);
    const adapter = await DatabaseAdapterFactory.createAndConnect(url);
    
    // Test basic connection
    const connectionTest = await adapter.testConnection();
    console.log('Firebase connection test result:', connectionTest);
    
    if (!connectionTest) {
      return res.status(500).json({ error: "Failed to connect to Firebase" });
    }

    // Try to get schema to see collections
    const schema = await adapter.getSchema();
    console.log('Firebase schema result:', schema);
    
    // If we have collections, try to read from the first one
    let sampleData = null;
    if (schema.success && schema.data && schema.data.length > 0) {
      const firstCollection = schema.data[0].name;
      console.log(`Attempting to read from collection: ${firstCollection}`);
      
      try {
        const readResult = await adapter.read(firstCollection, {}, 5);
        console.log('Firebase read result:', readResult);
        sampleData = readResult;
      } catch (readError) {
        console.error('Error reading from Firebase collection:', readError);
        sampleData = { error: readError.message };
      }
    }
    
    res.status(200).json({
      connectionTest,
      schema,
      sampleData,
      message: "Firebase connection test completed"
    });
  } catch (error) {
    console.error("Error testing Firebase connection:", error);
    res.status(500).json({ error: `Firebase test failed: ${error.message}` });
  }
};