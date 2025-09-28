import React, { useState } from 'react';
import { Plus, X, Save, Loader2, Link, Unlink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchema } from '../redux/Slice/dbSlice';

const CreateTableForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { connection, tables } = useSelector((s) => s.db);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { name: 'id', type: 'SERIAL', notNull: true, defaultValue: '', isPrimary: true }
  ]);
  const [foreignKeys, setForeignKeys] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get database-specific column types
  const getColumnTypes = () => {
    if (connection?.type === 'firebase') {
      return ['String', 'Number', 'Boolean', 'Date', 'Array', 'Object', 'Mixed'];
    } else if (connection?.type === 'mongodb') {
      return ['String', 'Number', 'Boolean', 'Date', 'Array', 'Object', 'Mixed', 'ObjectId'];
    } else if (connection?.type === 'supabase') {
      return [
        'SERIAL', 'INTEGER', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 
        'TIMESTAMP', 'DATE', 'NUMERIC', 'JSON', 'UUID', 'DECIMAL', 'REAL'
      ];
    } else {
      // PostgreSQL default
      return [
        'SERIAL', 'INTEGER', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN',
        'TIMESTAMP', 'DATE', 'NUMERIC', 'JSON', 'UUID', 'DECIMAL', 'REAL',
        'DOUBLE PRECISION', 'CHAR(1)', 'BYTEA'
      ];
    }
  };

  const columnTypes = getColumnTypes();

  // Get initial column structure based on database type
  const getInitialColumn = () => {
    if (connection?.type === 'firebase' || connection?.type === 'mongodb') {
      return { name: 'id', type: 'String', required: true, defaultValue: '' };
    } else {
      return { name: 'id', type: 'SERIAL', notNull: true, defaultValue: '', isPrimary: true };
    }
  };

  const addColumn = () => {
    if (connection?.type === 'firebase' || connection?.type === 'mongodb') {
      setColumns([...columns, { 
        name: '', 
        type: 'String', 
        required: false, 
        defaultValue: ''
      }]);
    } else {
      setColumns([...columns, { 
        name: '', 
        type: 'VARCHAR(255)', 
        notNull: false, 
        defaultValue: '',
        isPrimary: false
      }]);
    }
  };

  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const addForeignKey = () => {
    setForeignKeys([...foreignKeys, {
      column: '',
      referenceTable: '',
      referenceColumn: '',
      constraintName: ''
    }]);
  };

  const removeForeignKey = (index) => {
    setForeignKeys(foreignKeys.filter((_, i) => i !== index));
  };

  const updateForeignKey = (index, field, value) => {
    const newForeignKeys = [...foreignKeys];
    newForeignKeys[index] = { ...newForeignKeys[index], [field]: value };
    setForeignKeys(newForeignKeys);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!tableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) {
      alert('Please add at least one column');
      return;
    }

    // Format columns based on database type
    let formattedColumns;
    if (connection?.type === 'firebase' || connection?.type === 'mongodb') {
      // NoSQL databases use different column structure
      formattedColumns = validColumns.map(col => ({
        name: col.name,
        type: col.type,
        required: col.required || false,
        defaultValue: col.defaultValue
      }));
    } else {
      // SQL databases (PostgreSQL, Supabase)
      formattedColumns = validColumns.map(col => ({
        name: col.name,
        type: col.isPrimary ? 'SERIAL PRIMARY KEY' : col.type,
        notNull: col.notNull,
        defaultValue: col.defaultValue
      }));
    }

    // Filter valid foreign keys (only for SQL databases)
    const validForeignKeys = (connection?.type !== 'firebase' && connection?.type !== 'mongodb') 
      ? foreignKeys.filter(fk => fk.column && fk.referenceTable && fk.referenceColumn)
      : [];

    try {
      setLoading(true);
      let res;
      if (validForeignKeys.length > 0) {
        res = await fetch('http://localhost:9000/api/v1/db/create-with-constraints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: connection.url, 
            tablename: tableName, 
            columns: formattedColumns, 
            foreignKeys: validForeignKeys 
          })
        });
      } else {
        const cols = formattedColumns.map(c => ({ name: c.name, type: c.type }));
        res = await fetch('http://localhost:9000/api/v1/db/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: connection.url, tablename: tableName, columns: cols })
        });
      }
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || j.message || 'Failed to create table');
      }
      
      const result = await res.json();
      console.log('Table creation result:', result);
      
      // Refresh schema
      await dispatch(fetchSchema({ url: connection.url }));
      onClose();
    } catch (err) {
      console.error('Table creation error:', err);
      
      // Handle specific Firebase permission errors
      if (connection?.type === 'firebase' && err.message && err.message.includes('permission')) {
        setError(
          'Firebase permission denied. Please update your Firestore security rules to allow read/write access during development. ' +
          'Go to Firebase Console > Firestore Database > Rules and temporarily set: allow read, write: if true;'
        );
      } else {
        setError(err.message || 'Failed to create the table');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get available tables for foreign key references
  const availableTables = tables.filter(table => table.name !== tableName);
  const availableColumns = (tableName) => {
    const table = tables.find(t => t.name === tableName);
    return table?.schema || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Table</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Table Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Name
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter table name"
                required
              />
            </div>

            {/* Advanced Options Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>

            {/* Columns */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Columns
                </label>
                <button
                  type="button"
                  onClick={addColumn}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Column
                </button>
              </div>

              <div className="space-y-3">
                {columns.map((column, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Column Name
                        </label>
                        <input
                          type="text"
                          value={column.name}
                          onChange={(e) => updateColumn(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Column name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data Type
                        </label>
                        <select
                          value={column.type}
                          onChange={(e) => updateColumn(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {columnTypes.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      {showAdvanced && (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={connection?.type === 'firebase' || connection?.type === 'mongodb' ? column.required : column.notNull}
                              onChange={(e) => updateColumn(index, connection?.type === 'firebase' || connection?.type === 'mongodb' ? 'required' : 'notNull', e.target.checked)}
                              className="rounded"
                            />
                            <label className="text-xs font-medium text-gray-600">
                              {connection?.type === 'firebase' || connection?.type === 'mongodb' ? 'Required' : 'NOT NULL'}
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Default Value
                            </label>
                            <input
                              type="text"
                              value={column.defaultValue}
                              onChange={(e) => updateColumn(index, 'defaultValue', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Default value"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {(connection?.type !== 'firebase' && connection?.type !== 'mongodb') && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={column.isPrimary}
                            onChange={(e) => updateColumn(index, 'isPrimary', e.target.checked)}
                            className="rounded"
                          />
                          <label className="text-xs font-medium text-gray-600">
                            Primary Key
                          </label>
                        </div>
                      )}
                      {columns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Foreign Keys - Only for SQL databases */}
            {availableTables.length > 0 && (connection?.type !== 'firebase' && connection?.type !== 'mongodb') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Foreign Keys
                  </label>
                  <button
                    type="button"
                    onClick={addForeignKey}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Link className="h-4 w-4" />
                    Add Foreign Key
                  </button>
                </div>

                <div className="space-y-3">
                  {foreignKeys.map((fk, index) => (
                    <div key={index} className="border border-green-200 rounded-md p-4 bg-green-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Column
                          </label>
                          <select
                            value={fk.column}
                            onChange={(e) => updateForeignKey(index, 'column', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select column</option>
                            {columns.filter(col => col.name.trim() !== '').map(col => (
                              <option key={col.name} value={col.name}>
                                {col.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Reference Table
                          </label>
                          <select
                            value={fk.referenceTable}
                            onChange={(e) => {
                              updateForeignKey(index, 'referenceTable', e.target.value);
                              updateForeignKey(index, 'referenceColumn', '');
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select table</option>
                            {availableTables.map(table => (
                              <option key={table.name} value={table.name}>
                                {table.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Reference Column
                          </label>
                          <select
                            value={fk.referenceColumn}
                            onChange={(e) => updateForeignKey(index, 'referenceColumn', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={!fk.referenceTable}
                          >
                            <option value="">Select column</option>
                            {fk.referenceTable && availableColumns(fk.referenceTable).map(col => (
                              <option key={col.name} value={col.name}>
                                {col.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Constraint Name
                          </label>
                          <input
                            type="text"
                            value={fk.constraintName}
                            onChange={(e) => updateForeignKey(index, 'constraintName', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Auto-generated if empty"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => removeForeignKey(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Unlink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Table
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTableForm; 