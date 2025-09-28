import { PostgreSQLAdapter } from './PostgreSQLAdapter.js';
import { createClient } from '@supabase/supabase-js';

export class SupabaseAdapter extends PostgreSQLAdapter {
  constructor(connectionConfig) {
    // If connectionConfig is a string (PostgreSQL connection string), parse it
    if (typeof connectionConfig === 'string') {
      // This is a PostgreSQL connection string for Supabase
      super(connectionConfig);
      this.supabaseConfig = {
        url: connectionConfig, // Store the original PostgreSQL connection string
        type: 'supabase'
      };
      this.supabaseClient = null;
    } else {
      // Convert Supabase config to PostgreSQL connection string
      const pgConnectionString = SupabaseAdapter._buildPostgreSQLConnectionString(connectionConfig);
      super(pgConnectionString);
      
      this.supabaseConfig = connectionConfig;
      this.supabaseClient = null;
    }
  }

  static _buildPostgreSQLConnectionString(config) {
    // Extract project reference from Supabase URL
    const projectRef = config.url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
      throw new Error('Invalid Supabase URL format');
    }

    // Build PostgreSQL connection string for direct database access
    return `postgresql://postgres:${config.serviceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`;
  }

  async connect() {
    try {
      // If we have a direct PostgreSQL connection string, just use PostgreSQL adapter
      if (typeof this.supabaseConfig.url === 'string' && this.supabaseConfig.url.startsWith('postgresql://')) {
        // Use PostgreSQL connection directly
        await super.connect();
        return true;
      }
      
      // Initialize Supabase client for API-based connections
      if (this.supabaseConfig.url && this.supabaseConfig.anonKey) {
        this.supabaseClient = createClient(this.supabaseConfig.url, this.supabaseConfig.anonKey);
      }
      
      // Also connect via PostgreSQL for advanced operations
      await super.connect();
      
      return true;
    } catch (error) {
      console.error('Supabase connection failed:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      // If we have a direct PostgreSQL connection string, test PostgreSQL connection
      if (typeof this.supabaseConfig.url === 'string' && this.supabaseConfig.url.startsWith('postgresql://')) {
        return await super.testConnection();
      }
      
      // Test Supabase API connection
      if (this.supabaseConfig.url && this.supabaseConfig.anonKey) {
        const testClient = createClient(this.supabaseConfig.url, this.supabaseConfig.anonKey);
        
        // Test with a simple query
        const { data, error } = await testClient
          .from('_supabase_test_connection')
          .select('*')
          .limit(1);
        
        // Even if the table doesn't exist, if we get a proper error response, connection is working
        return !error || error.code !== 'PGRST003'; // PGRST003 means table not found, which is fine
      }
      
      // Fallback to PostgreSQL test
      return await super.testConnection();
    } catch (error) {
      console.error('Supabase test connection failed:', error);
      return false;
    }
  }

  // Override insert to use Supabase client for better error handling and features
  async insert(tableName, data) {
    if (!this.supabaseClient) await this.connect();

    try {
      const values = Array.isArray(data) ? data : [data];
      
      const { data: result, error } = await this.supabaseClient
        .from(tableName)
        .insert(values)
        .select();

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      return {
        success: true,
        data: result,
        message: "Data inserted successfully"
      };
    } catch (error) {
      console.error('Error inserting into Supabase:', error);
      // Fall back to PostgreSQL adapter
      return super.insert(tableName, data);
    }
  }

  // Override read to use Supabase client for better filtering
  async read(tableName, filters = {}, limit = null) {
    if (!this.supabaseClient) await this.connect();

    try {
      let query = this.supabaseClient.from(tableName).select('*');

      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      // Apply limit
      if (limit && Number.isInteger(limit)) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Supabase read error: ${error.message}`);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error reading from Supabase:', error);
      // Fall back to PostgreSQL adapter
      return super.read(tableName, filters, limit);
    }
  }

  // Override update to use Supabase client
  async update(tableName, id, updates, idColumn = 'id') {
    if (!this.supabaseClient) await this.connect();

    try {
      const { data, error } = await this.supabaseClient
        .from(tableName)
        .update(updates)
        .eq(idColumn, id)
        .select();

      if (error) {
        throw new Error(`Supabase update error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return { success: false, message: "No record found to update." };
      }

      return {
        success: true,
        data: data[0],
        message: "Record updated successfully"
      };
    } catch (error) {
      console.error('Error updating Supabase record:', error);
      // Fall back to PostgreSQL adapter
      return super.update(tableName, id, updates, idColumn);
    }
  }

  // Override delete to use Supabase client
  async delete(tableName, id, idColumn = 'id') {
    if (!this.supabaseClient) await this.connect();

    try {
      const { data, error } = await this.supabaseClient
        .from(tableName)
        .delete()
        .eq(idColumn, id)
        .select();

      if (error) {
        throw new Error(`Supabase delete error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return { success: false, message: "No record found to delete." };
      }

      return {
        success: true,
        data: data[0],
        message: "Record deleted successfully"
      };
    } catch (error) {
      console.error('Error deleting Supabase record:', error);
      // Fall back to PostgreSQL adapter
      return super.delete(tableName, id, idColumn);
    }
  }

  // Enhanced schema method that includes Supabase-specific features
  async getSchema() {
    try {
      // Get basic PostgreSQL schema
      const postgresSchema = await super.getSchema();
      
      if (!this.supabaseClient) await this.connect();

      // Enhance with Supabase-specific information
      const enhancedTables = await Promise.all(
        postgresSchema.data.map(async (table) => {
          try {
            // Get Supabase RLS policies if available
            const { data: policies } = await this.supabaseClient
              .rpc('get_policies', { table_name: table.name })
              .single();

            return {
              ...table,
              supabaseFeatures: {
                realtime: true, // Supabase supports realtime by default
                rls: policies ? true : false,
                policies: policies || []
              }
            };
          } catch (error) {
            // If RLS info is not available, return basic table info
            return {
              ...table,
              supabaseFeatures: {
                realtime: true,
                rls: false,
                policies: []
              }
            };
          }
        })
      );

      return {
        success: true,
        data: enhancedTables
      };
    } catch (error) {
      console.error('Error fetching Supabase schema:', error);
      // Fall back to PostgreSQL schema
      return super.getSchema();
    }
  }

  // Supabase-specific method to enable realtime
  async enableRealtime(tableName) {
    if (!this.supabaseClient) await this.connect();

    try {
      // This would typically be done via Supabase dashboard or SQL
      // Here we'll use direct SQL via the PostgreSQL connection
      await this.pool.query(`ALTER TABLE ${tableName} REPLICA IDENTITY FULL;`);
      
      return {
        success: true,
        message: `Realtime enabled for table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error enabling Supabase realtime:', error);
      throw error;
    }
  }

  // Supabase-specific method to manage RLS
  async enableRLS(tableName) {
    if (!this.pool) await this.connect();

    try {
      await this.pool.query(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
      
      return {
        success: true,
        message: `Row Level Security enabled for table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error enabling Supabase RLS:', error);
      throw error;
    }
  }

  async disableRLS(tableName) {
    if (!this.pool) await this.connect();

    try {
      await this.pool.query(`ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;`);
      
      return {
        success: true,
        message: `Row Level Security disabled for table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error disabling Supabase RLS:', error);
      throw error;
    }
  }

  // Supabase-specific method to create RLS policies
  async createPolicy(tableName, policyName, operation, condition) {
    if (!this.pool) await this.connect();

    try {
      const sql = `
        CREATE POLICY ${policyName} ON ${tableName}
        FOR ${operation.toUpperCase()} 
        USING (${condition});
      `;
      
      await this.pool.query(sql);
      
      return {
        success: true,
        message: `Policy '${policyName}' created for table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error creating Supabase policy:', error);
      throw error;
    }
  }

  async dropPolicy(tableName, policyName) {
    if (!this.pool) await this.connect();

    try {
      await this.pool.query(`DROP POLICY ${policyName} ON ${tableName};`);
      
      return {
        success: true,
        message: `Policy '${policyName}' dropped from table '${tableName}'.`
      };
    } catch (error) {
      console.error('Error dropping Supabase policy:', error);
      throw error;
    }
  }
}