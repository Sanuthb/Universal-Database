// Database Adapter Interface - Base class for all database adapters
export class DatabaseAdapter {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.isConnected = false;
  }

  // Abstract methods that must be implemented by each adapter
  async connect() {
    throw new Error('connect() must be implemented by database adapter');
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented by database adapter');
  }

  async testConnection() {
    throw new Error('testConnection() must be implemented by database adapter');
  }

  async createTable(tableName, columns, foreignKeys = []) {
    throw new Error('createTable() must be implemented by database adapter');
  }

  async dropTable(tableName) {
    throw new Error('dropTable() must be implemented by database adapter');
  }

  async insert(tableName, data) {
    throw new Error('insert() must be implemented by database adapter');
  }

  async read(tableName, filters = {}, limit = null) {
    throw new Error('read() must be implemented by database adapter');
  }

  async update(tableName, id, updates, idColumn = 'id') {
    throw new Error('update() must be implemented by database adapter');
  }

  async delete(tableName, id, idColumn = 'id') {
    throw new Error('delete() must be implemented by database adapter');
  }

  async getSchema() {
    throw new Error('getSchema() must be implemented by database adapter');
  }

  async addColumn(tableName, column) {
    throw new Error('addColumn() must be implemented by database adapter');
  }

  async dropColumn(tableName, columnName) {
    throw new Error('dropColumn() must be implemented by database adapter');
  }

  async addForeignKey(tableName, column, referenceTable, referenceColumn, constraintName) {
    throw new Error('addForeignKey() must be implemented by database adapter');
  }

  async dropForeignKey(tableName, constraintName) {
    throw new Error('dropForeignKey() must be implemented by database adapter');
  }

  // Helper method to parse connection strings
  static parseConnectionString(connectionString) {
    if (connectionString.startsWith('postgresql://') || connectionString.startsWith('postgres://')) {
      // Check if it's a Supabase connection
      if (connectionString.includes('.supabase.co')) {
        return { type: 'supabase', url: connectionString };
      }
      return { type: 'postgresql', url: connectionString };
    }
    
    if (connectionString.startsWith('mongodb://') || connectionString.startsWith('mongodb+srv://')) {
      return { type: 'mongodb', url: connectionString };
    }
    
    if (connectionString.startsWith('firebase://')) {
      // Format: firebase://project-id:api-key@auth-domain/storage-bucket
      const match = connectionString.match(/^firebase:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)$/);
      if (match) {
        return {
          type: 'firebase',
          projectId: match[1],
          apiKey: match[2],
          authDomain: match[3],
          storageBucket: match[4]
        };
      }
    }
    
    if (connectionString.startsWith('supabase://')) {
      // Format: supabase://project-ref.supabase.co:anon-key@service-role-key
      const match = connectionString.match(/^supabase:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        return {
          type: 'supabase',
          url: `https://${match[1]}.supabase.co`,
          anonKey: match[2],
          serviceRoleKey: match[3]
        };
      }
    }
    
    throw new Error(`Unsupported database connection string: ${connectionString}`);
  }
}