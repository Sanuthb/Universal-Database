import { DatabaseAdapter } from '../DatabaseAdapter.js';
import mongoose from 'mongoose';

export class MongoDBAdapter extends DatabaseAdapter {
  constructor(connectionString) {
    super(connectionString);
    this.connection = null;
    this.models = new Map();
  }

  async connect() {
    try {
      this.connection = await mongoose.createConnection(this.connectionString, {
        serverSelectionTimeoutMS: 10000
      });
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.isConnected = false;
    }
  }

  async testConnection() {
    try {
      const testConnection = await mongoose.createConnection(this.connectionString, {
        serverSelectionTimeoutMS: 5000
      });
      await testConnection.close();
      return true;
    } catch (error) {
      console.error('MongoDB test connection failed:', error);
      return false;
    }
  }

  // Helper method to create/get dynamic schema
  _getModel(tableName, sampleData = null) {
    if (this.models.has(tableName)) {
      return this.models.get(tableName);
    }

    // Create dynamic schema based on sample data
    let schemaDefinition = {};
    
    if (sampleData) {
      Object.keys(sampleData).forEach(key => {
        const value = sampleData[key];
        if (typeof value === 'string') {
          schemaDefinition[key] = String;
        } else if (typeof value === 'number') {
          schemaDefinition[key] = Number;
        } else if (typeof value === 'boolean') {
          schemaDefinition[key] = Boolean;
        } else if (value instanceof Date) {
          schemaDefinition[key] = Date;
        } else {
          schemaDefinition[key] = mongoose.Schema.Types.Mixed;
        }
      });
    } else {
      // Default flexible schema
      schemaDefinition = { data: mongoose.Schema.Types.Mixed };
    }

    // Add timestamps by default
    const schema = new mongoose.Schema(schemaDefinition, { 
      timestamps: true, 
      strict: false  // Allow additional fields
    });

    const model = this.connection.model(tableName, schema);
    this.models.set(tableName, model);
    return model;
  }

  async createTable(tableName, columns, foreignKeys = []) {
    if (!this.connection) await this.connect();

    try {
      // In MongoDB, collections are created automatically when first document is inserted
      // We'll create a schema definition based on the columns
      const schemaDefinition = {};
      
      columns.forEach(col => {
        switch (col.type.toLowerCase()) {
          case 'string':
          case 'varchar':
          case 'text':
            schemaDefinition[col.name] = { 
              type: String, 
              required: col.notNull || false,
              default: col.defaultValue
            };
            break;
          case 'number':
          case 'integer':
          case 'int':
            schemaDefinition[col.name] = { 
              type: Number, 
              required: col.notNull || false,
              default: col.defaultValue
            };
            break;
          case 'boolean':
          case 'bool':
            schemaDefinition[col.name] = { 
              type: Boolean, 
              required: col.notNull || false,
              default: col.defaultValue
            };
            break;
          case 'date':
          case 'timestamp':
            schemaDefinition[col.name] = { 
              type: Date, 
              required: col.notNull || false,
              default: col.defaultValue === 'NOW()' ? Date.now : col.defaultValue
            };
            break;
          default:
            schemaDefinition[col.name] = { 
              type: mongoose.Schema.Types.Mixed, 
              required: col.notNull || false 
            };
        }
      });

      // Handle foreign keys as references
      if (foreignKeys && foreignKeys.length > 0) {
        foreignKeys.forEach(fk => {
          if (schemaDefinition[fk.column]) {
            schemaDefinition[fk.column] = {
              type: mongoose.Schema.Types.ObjectId,
              ref: fk.referenceTable,
              required: schemaDefinition[fk.column].required || false
            };
          }
        });
      }

      const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
      const model = this.connection.model(tableName, schema);
      this.models.set(tableName, model);

      return { 
        success: true, 
        message: `Collection '${tableName}' schema created successfully.` 
      };
    } catch (error) {
      console.error('Error creating MongoDB collection:', error);
      throw error;
    }
  }

  async dropTable(tableName) {
    if (!this.connection) await this.connect();

    try {
      await this.connection.db.collection(tableName).drop();
      this.models.delete(tableName);
      return { 
        success: true, 
        message: `Collection '${tableName}' dropped successfully.` 
      };
    } catch (error) {
      if (error.code === 26) { // Collection doesn't exist
        return { 
          success: true, 
          message: `Collection '${tableName}' doesn't exist.` 
        };
      }
      console.error('Error dropping MongoDB collection:', error);
      throw error;
    }
  }

  async insert(tableName, data) {
    if (!this.connection) await this.connect();

    try {
      const values = Array.isArray(data) ? data : [data];
      const model = this._getModel(tableName, values[0]);

      const result = await model.insertMany(values);

      return {
        success: true,
        data: result,
        message: "Data inserted successfully"
      };
    } catch (error) {
      console.error('Error inserting into MongoDB:', error);
      throw error;
    }
  }

  async read(tableName, filters = {}, limit = null) {
    if (!this.connection) await this.connect();

    try {
      const model = this._getModel(tableName);
      
      let query = model.find(filters);
      
      if (limit && Number.isInteger(limit)) {
        query = query.limit(limit);
      }

      const result = await query.exec();

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error reading from MongoDB:', error);
      throw error;
    }
  }

  async update(tableName, id, updates, idColumn = '_id') {
    if (!this.connection) await this.connect();

    try {
      const model = this._getModel(tableName);
      
      const filter = { [idColumn]: id };
      const result = await model.findOneAndUpdate(
        filter, 
        updates, 
        { new: true, runValidators: true }
      );

      if (!result) {
        return { success: false, message: "No record found to update." };
      }

      return {
        success: true,
        data: result,
        message: "Record updated successfully"
      };
    } catch (error) {
      console.error('Error updating MongoDB record:', error);
      throw error;
    }
  }

  async delete(tableName, id, idColumn = '_id') {
    if (!this.connection) await this.connect();

    try {
      const model = this._getModel(tableName);
      
      const filter = { [idColumn]: id };
      const result = await model.findOneAndDelete(filter);

      if (!result) {
        return { success: false, message: "No record found to delete." };
      }

      return {
        success: true,
        data: result,
        message: "Record deleted successfully"
      };
    } catch (error) {
      console.error('Error deleting MongoDB record:', error);
      throw error;
    }
  }

  async getSchema() {
    if (!this.connection) await this.connect();

    try {
      const collections = await this.connection.db.listCollections().toArray();
      
      const collectionsWithSchema = await Promise.all(
        collections.map(async (collection) => {
          const collectionName = collection.name;
          
          // Get sample document to infer schema
          const sampleDoc = await this.connection.db
            .collection(collectionName)
            .findOne({});

          const columns = [];
          if (sampleDoc) {
            Object.keys(sampleDoc).forEach(key => {
              const value = sampleDoc[key];
              let type = 'Mixed';
              
              if (typeof value === 'string') type = 'String';
              else if (typeof value === 'number') type = 'Number';
              else if (typeof value === 'boolean') type = 'Boolean';
              else if (value instanceof Date) type = 'Date';
              else if (value && typeof value === 'object') type = 'Object';

              columns.push({
                name: key,
                type: type,
                nullable: true,
                defaultValue: null
              });
            });
          }

          return {
            name: collectionName,
            type: 'collection',
            columns: columns,
            foreignKeys: [] // MongoDB doesn't have traditional foreign keys
          };
        })
      );

      return {
        success: true,
        data: collectionsWithSchema
      };
    } catch (error) {
      console.error('Error fetching MongoDB schema:', error);
      throw error;
    }
  }

  async addColumn(tableName, column) {
    // MongoDB is schemaless, so we don't need to explicitly add columns
    // This is a no-op for MongoDB
    return {
      success: true,
      message: `MongoDB is schemaless. Field '${column.name}' can be added by inserting documents with this field.`
    };
  }

  async dropColumn(tableName, columnName) {
    if (!this.connection) await this.connect();

    try {
      // In MongoDB, we remove the field from all documents
      const result = await this.connection.db
        .collection(tableName)
        .updateMany({}, { $unset: { [columnName]: "" } });

      return {
        success: true,
        message: `Field '${columnName}' removed from ${result.modifiedCount} documents in collection '${tableName}'.`
      };
    } catch (error) {
      console.error('Error removing MongoDB field:', error);
      throw error;
    }
  }

  async addForeignKey(tableName, column, referenceTable, referenceColumn, constraintName) {
    // MongoDB doesn't have traditional foreign keys, but we can create a reference
    return {
      success: true,
      message: `MongoDB uses references instead of foreign keys. Configure your application to treat '${column}' as a reference to '${referenceTable}'.`
    };
  }

  async dropForeignKey(tableName, constraintName) {
    // MongoDB doesn't have traditional foreign keys
    return {
      success: true,
      message: `MongoDB doesn't use traditional foreign key constraints.`
    };
  }
}