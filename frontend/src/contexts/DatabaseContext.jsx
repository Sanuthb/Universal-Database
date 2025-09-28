import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTableData } from '../hooks/useTableData';

const DatabaseContext = createContext(undefined);

export const DatabaseProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedDatabases, setSupportedDatabases] = useState(null);

  const {
    data,
    loading: dataLoading,
    error: dataError,
    fetchData,
    insertRow,
    updateRow,
    deleteRow,
    createTable: createTableAPI,
    dropTable: dropTableAPI,
    testConnection: testConnectionAPI,
    clearError
  } = useTableData();

  const connect = useCallback(async (url, type = 'auto') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:9000/api/v1/db/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setConnection({ 
          url, 
          type: result.type || type, 
          connected: true 
        });
        return true;
      } else {
        setError(result.error || 'Failed to connect to database');
        return false;
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnection(null);
    setTables([]);
    setSelectedTable(null);
    setError(null);
  }, []);

  const fetchTables = useCallback(async () => {
    if (!connection?.url) {
      setError('No database connection');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:9000/api/v1/db/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const tableList = result.data?.map(table => ({
          name: table.name,
          type: table.type || 'table',
          schema: table.columns || [],
          foreignKeys: table.foreignKeys || []
        })) || [];
        
        setTables(tableList);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to fetch tables');
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      setError('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  }, [connection]);

  const fetchTableSchema = useCallback(async (tableName) => {
    if (!connection?.url || !tableName) return;

    try {
      setLoading(true);
      
      // The schema is already fetched with tables in the new implementation
      // This function is kept for backward compatibility
      const table = tables.find(t => t.name === tableName);
      if (table && table.schema && table.schema.length > 0) {
        return table.schema;
      }
      
      // If schema is not available, fetch it
      await fetchTables();
      
    } catch (error) {
      console.error('Failed to fetch table schema:', error);
    } finally {
      setLoading(false);
    }
  }, [connection, tables, fetchTables]);

  const selectTable = useCallback((table) => {
    setSelectedTable(table);
    // Fetch schema if not already loaded
    if (table && (!table.schema || table.schema.length === 0)) {
      fetchTableSchema(table.name);
    }
  }, [fetchTableSchema]);

  const createTable = useCallback(async (tableName, schema, foreignKeys = []) => {
    if (!connection?.url) {
      setError('No database connection');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Use enhanced table creation with constraints if foreign keys are provided
      if (foreignKeys && foreignKeys.length > 0) {
        const response = await fetch('http://localhost:9000/api/v1/db/create-with-constraints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: connection.url,
            tablename: tableName,
            columns: schema,
            foreignKeys
          }),
        });

        if (response.ok) {
          const newTable = {
            name: tableName,
            type: 'table',
            schema
          };

          setTables(prev => [...prev, newTable]);
          return true;
        } else {
          const result = await response.json();
          setError(result.error || 'Failed to create table');
          return false;
        }
      } else {
        // Use regular table creation
        const columns = schema.map(col => ({
          name: col.name,
          type: col.type
        }));

        const success = await createTableAPI(connection.url, tableName, columns);
        
        if (success) {
          const newTable = {
            name: tableName,
            type: 'table',
            schema
          };

          setTables(prev => [...prev, newTable]);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Failed to create table:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [connection, createTableAPI]);

  const dropTable = useCallback(async (tableName) => {
    if (!connection?.url) {
      setError('No database connection');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const success = await dropTableAPI(connection.url, tableName);
      
      if (success) {
        setTables(prev => prev.filter(table => table.name !== tableName));
        if (selectedTable?.name === tableName) {
          setSelectedTable(null);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to drop table:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [connection, dropTableAPI, selectedTable]);

  const loadTableData = useCallback(async (tableName, filters = {}, limit = 10) => {
    if (!connection?.url || !tableName) return;
    
    await fetchData(connection.url, tableName, filters, limit);
  }, [connection, fetchData]);

  const insertTableData = useCallback(async (tableName, values) => {
    if (!connection?.url || !tableName) return false;
    setLoading(true);
    try {
      const success = await insertRow(connection.url, tableName, values);
      if (success) {
        // NeonDB may have slight replication lag
        await new Promise(res => setTimeout(res, 300));
        await fetchData(connection.url, tableName);
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, [connection, insertRow, fetchData]);

  const updateTableData = useCallback(async (tableName, id, updates, idColumn = 'id') => {
    if (!connection?.url || !tableName) return false;
    
    return await updateRow(connection.url, tableName, id, updates, idColumn);
  }, [connection, updateRow]);

  const deleteTableData = useCallback(async (tableName, id, idColumn = 'id') => {
    if (!connection?.url || !tableName) return false;
    
    return await deleteRow(connection.url, tableName, id, idColumn);
  }, [connection, deleteRow]);

  const fetchSupportedDatabases = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:9000/api/v1/db/supported-databases');
      if (response.ok) {
        const result = await response.json();
        setSupportedDatabases(result);
        return result;
      }
    } catch (error) {
      console.error('Failed to fetch supported databases:', error);
    }
    return null;
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        connection,
        tables,
        selectedTable,
        loading: loading || dataLoading,
        error: error || dataError,
        data,
        supportedDatabases,
        connect,
        disconnect,
        fetchTables,
        fetchTableSchema,
        selectTable,
        createTable,
        dropTable,
        loadTableData,
        insertTableData,
        updateTableData,
        deleteTableData,
        fetchSupportedDatabases,
        clearError: () => {
          setError(null);
          clearError();
        }
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};
