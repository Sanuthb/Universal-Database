import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2, Link, Unlink } from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const CreateTableForm = ({ onClose }) => {
  const { createTable, loading, error, clearError, connection, tables } = useDatabaseContext();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { name: 'id', type: 'SERIAL', notNull: true, defaultValue: '', isPrimary: true }
  ]);
  const [foreignKeys, setForeignKeys] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const columnTypes = [
    'SERIAL',
    'INTEGER',
    'BIGINT',
    'VARCHAR(255)',
    'TEXT',
    'BOOLEAN',
    'TIMESTAMP',
    'DATE',
    'NUMERIC',
    'JSON',
    'UUID',
    'DECIMAL',
    'REAL',
    'DOUBLE PRECISION',
    'CHAR(1)',
    'BYTEA'
  ];

  const addColumn = () => {
    setColumns([...columns, { 
      name: '', 
      type: 'VARCHAR(255)', 
      notNull: false, 
      defaultValue: '',
      isPrimary: false
    }]);
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
    
    if (!tableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) {
      alert('Please add at least one column');
      return;
    }

    // Format columns for backend
    const formattedColumns = validColumns.map(col => ({
      name: col.name,
      type: col.isPrimary ? 'SERIAL PRIMARY KEY' : col.type,
      notNull: col.notNull,
      defaultValue: col.defaultValue
    }));

    // Filter valid foreign keys
    const validForeignKeys = foreignKeys.filter(fk => 
      fk.column && fk.referenceTable && fk.referenceColumn
    );

    const success = await createTable(tableName, formattedColumns, validForeignKeys);
    if (success) {
      onClose();
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
                <button
                  onClick={clearError}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  ×
                </button>
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
                              checked={column.notNull}
                              onChange={(e) => updateColumn(index, 'notNull', e.target.checked)}
                              className="rounded"
                            />
                            <label className="text-xs font-medium text-gray-600">
                              NOT NULL
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

            {/* Foreign Keys */}
            {availableTables.length > 0 && (
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