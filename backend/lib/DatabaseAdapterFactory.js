import { DatabaseAdapter } from './DatabaseAdapter.js';
import { PostgreSQLAdapter } from './adapters/PostgreSQLAdapter.js';
import { MongoDBAdapter } from './adapters/MongoDBAdapter.js';
import { FirebaseAdapter } from './adapters/FirebaseAdapter.js';
import { SupabaseAdapter } from './adapters/SupabaseAdapter.js';

// Cache for database adapters to reuse connections
const adapterCache = new Map();

export class DatabaseAdapterFactory {
  /**
   * Creates a database adapter based on the connection string or configuration
   * @param {string|object} connectionStringOrConfig - Connection string or configuration object
   * @returns {DatabaseAdapter} - Appropriate database adapter instance
   */
  static createAdapter(connectionStringOrConfig) {
    try {
      let config;
      let cacheKey;

      // Handle different input types
      if (typeof connectionStringOrConfig === 'string') {
        console.log('Parsing connection string:', connectionStringOrConfig);
        config = DatabaseAdapter.parseConnectionString(connectionStringOrConfig);
        console.log('Parsed config:', config);
        cacheKey = connectionStringOrConfig;
      } else {
        config = connectionStringOrConfig;
        cacheKey = JSON.stringify(config);
      }

      // Check cache first
      if (adapterCache.has(cacheKey)) {
        console.log('Using cached adapter for:', config.type);
        return adapterCache.get(cacheKey);
      }

      let adapter;

      console.log('Creating new adapter for type:', config.type);

      switch (config.type) {
        case 'postgresql':
          adapter = new PostgreSQLAdapter(config.url);
          break;

        case 'mongodb':
          adapter = new MongoDBAdapter(config.url);
          break;

        case 'firebase':
          adapter = new FirebaseAdapter(config);
          break;

        case 'supabase':
          adapter = new SupabaseAdapter(config);
          break;

        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }

      // Cache the adapter
      adapterCache.set(cacheKey, adapter);
      
      console.log('Adapter created and cached for:', config.type);
      return adapter;
    } catch (error) {
      console.error('Error creating database adapter:', error);
      throw error;
    }
  }

  /**
   * Get supported database types
   * @returns {Array<string>} - Array of supported database types
   */
  static getSupportedTypes() {
    return ['postgresql', 'mongodb', 'firebase', 'supabase'];
  }

  /**
   * Validate connection string format
   * @param {string} connectionString - Connection string to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  static validateConnectionString(connectionString) {
    try {
      DatabaseAdapter.parseConnectionString(connectionString);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get connection string examples for each database type
   * @returns {object} - Object with examples for each database type
   */
  static getConnectionStringExamples() {
    return {
      postgresql: 'postgresql://username:password@host:port/database',
      mongodb: 'mongodb://username:password@host:port/database',
      firebase: 'firebase://project-id:api-key@auth-domain/storage-bucket',
      supabase: 'supabase://project-ref.supabase.co:anon-key@service-role-key'
    };
  }

  /**
   * Clear adapter cache (useful for testing or cleanup)
   */
  static clearCache() {
    adapterCache.clear();
  }

  /**
   * Remove specific adapter from cache
   * @param {string} connectionString - Connection string to remove from cache
   */
  static removeFromCache(connectionString) {
    adapterCache.delete(connectionString);
  }

  /**
   * Get adapter from cache without creating new one
   * @param {string} connectionString - Connection string to lookup
   * @returns {DatabaseAdapter|null} - Cached adapter or null if not found
   */
  static getCachedAdapter(connectionString) {
    return adapterCache.get(connectionString) || null;
  }

  /**
   * Test connection for a given connection string
   * @param {string|object} connectionStringOrConfig - Connection string or config
   * @returns {Promise<boolean>} - True if connection successful
   */
  static async testConnection(connectionStringOrConfig) {
    try {
      const adapter = DatabaseAdapterFactory.createAdapter(connectionStringOrConfig);
      return await adapter.testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database type from connection string
   * @param {string} connectionString - Connection string to analyze
   * @returns {string} - Database type
   */
  static getDatabaseType(connectionString) {
    try {
      const config = DatabaseAdapter.parseConnectionString(connectionString);
      return config.type;
    } catch (error) {
      throw new Error('Invalid connection string format');
    }
  }

  /**
   * Create adapter and ensure connection
   * @param {string|object} connectionStringOrConfig - Connection string or config
   * @returns {Promise<DatabaseAdapter>} - Connected adapter instance
   */
  static async createAndConnect(connectionStringOrConfig) {
    const adapter = DatabaseAdapterFactory.createAdapter(connectionStringOrConfig);
    
    if (!adapter.isConnected) {
      await adapter.connect();
    }
    
    return adapter;
  }

  /**
   * Disconnect all cached adapters
   * @returns {Promise<void>}
   */
  static async disconnectAll() {
    const disconnectPromises = Array.from(adapterCache.values()).map(adapter => {
      if (adapter.isConnected) {
        return adapter.disconnect();
      }
      return Promise.resolve();
    });

    await Promise.all(disconnectPromises);
    DatabaseAdapterFactory.clearCache();
  }

  /**
   * Get adapter statistics
   * @returns {object} - Statistics about cached adapters
   */
  static getStatistics() {
    const stats = {
      totalAdapters: adapterCache.size,
      connectedAdapters: 0,
      adaptersByType: {}
    };

    adapterCache.forEach(adapter => {
      if (adapter.isConnected) {
        stats.connectedAdapters++;
      }

      const type = adapter.constructor.name.replace('Adapter', '').toLowerCase();
      stats.adaptersByType[type] = (stats.adaptersByType[type] || 0) + 1;
    });

    return stats;
  }
}