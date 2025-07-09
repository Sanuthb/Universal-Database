import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:9000/api/v1/db';

export const useTableData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchData = useCallback(async (url, tablename, filters = {}, limit = 10) => {
    if (!url || !tablename) {
      setError('Database URL and table name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          tablename,
          filters,
          limit
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data || []);
      setPagination(prev => ({
        ...prev,
        total: result.data?.length || 0
      }));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const insertRow = useCallback(async (url, tablename, values) => {
    if (!url || !tablename || !values) {
      setError('Database URL, table name, and values are required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          tablename,
          values: Array.isArray(values) ? values : [values]
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to insert data');
      }

      // Refresh data after successful insert
      await fetchData(url, tablename);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error inserting data:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const updateRow = useCallback(async (url, tablename, id, updates, idColumn = 'id') => {
    if (!url || !tablename || !id || !updates) {
      setError('Database URL, table name, ID, and updates are required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          tablename,
          id,
          updates,
          idColumn
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update data');
      }

      // Refresh data after successful update
      await fetchData(url, tablename);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating data:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const deleteRow = useCallback(async (url, tablename, id, idColumn = 'id') => {
    if (!url || !tablename || !id) {
      setError('Database URL, table name, and ID are required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          tablename,
          idColumn
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete data');
      }

      // Refresh data after successful delete
      await fetchData(url, tablename);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting data:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const createTable = useCallback(async (url, tablename, columns) => {
    if (!url || !tablename || !columns) {
      setError('Database URL, table name, and columns are required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          tablename,
          columns
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create table');
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error creating table:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const dropTable = useCallback(async (url, tablename) => {
    if (!url || !tablename) {
      setError('Database URL and table name are required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/drop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          tablename
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to drop table');
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error dropping table:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (url) => {
    if (!url) {
      setError('Database URL is required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to connect to database');
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error testing connection:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    insertRow,
    updateRow,
    deleteRow,
    createTable,
    dropTable,
    testConnection,
    clearError: () => setError(null)
  };
}; 