import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Link, Unlink } from 'lucide-react';
import { useSelector } from 'react-redux';

const SchemaManager = () => {
  const { connection } = useSelector((s) => s.db);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddForeignKey, setShowAddForeignKey] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'VARCHAR(255)', notNull: false, defaultValue: '' });
  const [newForeignKey, setNewForeignKey] = useState({ column: '', referenceTable: '', referenceColumn: '', constraintName: '' });
  const [schemaData, setSchemaData] = useState(null);

  const columnTypes = [
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

  useEffect(() => {
    if (connection) {
      fetchSchemaData();
    }
  }, [connection]);

  const fetchSchemaData = async () => {
    if (!connection?.url) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:9000/api/v1/db/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: connection.url }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch schema');
      setSchemaData(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    if (!selectedTable || !newColumn.name || !newColumn.type) return;

    try {
      const response = await fetch('http://localhost:9000/api/v1/db/add-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          tablename: selectedTable.name,
          column: newColumn
        }),
      });

      if (response.ok) {
        setShowAddColumn(false);
        setNewColumn({ name: '', type: 'VARCHAR(255)', notNull: false, defaultValue: '' });
        fetchSchemaData();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDropColumn = async (columnName) => {
    if (!selectedTable || !columnName || !confirm(`Are you sure you want to drop column '${columnName}'?`)) return;

    try {
      const response = await fetch('http://localhost:9000/api/v1/db/drop-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          tablename: selectedTable.name,
          columnName
        }),
      });

      if (response.ok) {
        fetchSchemaData();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddForeignKey = async () => {
    if (!selectedTable || !newForeignKey.column || !newForeignKey.referenceTable || !newForeignKey.referenceColumn) return;

    try {
      const response = await fetch('http://localhost:9000/api/v1/db/add-foreign-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          tablename: selectedTable.name,
          ...newForeignKey
        }),
      });

      if (response.ok) {
        setShowAddForeignKey(false);
        setNewForeignKey({ column: '', referenceTable: '', referenceColumn: '', constraintName: '' });
        fetchSchemaData();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDropForeignKey = async (constraintName) => {
    if (!selectedTable || !constraintName || !confirm(`Are you sure you want to drop foreign key constraint '${constraintName}'?`)) return;

    try {
      const response = await fetch('http://localhost:9000/api/v1/db/drop-foreign-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          tablename: selectedTable.name,
          constraintName
        }),
      });

      if (response.ok) {
        fetchSchemaData();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (!connection) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please connect to a database first
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Database Schema Manager</h2>
        <button
          onClick={fetchSchemaData}
          disabled={loading}
          className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Database className="h-4 w-4" />
          Refresh Schema
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Table Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Table</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {schemaData?.map(table => (
            <button
              key={table.name}
              onClick={() => setSelectedTable(table)}
              className={`p-3 text-left rounded-md border transition-colors ${
                selectedTable?.name === table.name
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{table.name}</div>
              <div className="text-sm text-gray-500">
                {table.columns.length} columns
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Table Schema Details */}
      {selectedTable && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedTable.name} - Schema Details
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Column
              </button>
              <button
                onClick={() => setShowAddForeignKey(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Link className="h-4 w-4" />
                Add Foreign Key
              </button>
            </div>
          </div>

          {/* Columns */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Columns</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nullable
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTable.columns.map((column, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm text-gray-900">{column.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{column.type}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {column.nullable ? 'YES' : 'NO'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {column.defaultValue || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        <button
                          onClick={() => handleDropColumn(column.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Drop column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Foreign Keys */}
          {selectedTable.foreignKeys && selectedTable.foreignKeys.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Foreign Keys</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Column
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        References
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Constraint
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedTable.foreignKeys.map((fk, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">{fk.column}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {fk.referenceTable}.{fk.referenceColumn}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">{fk.constraintName}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          <button
                            onClick={() => handleDropForeignKey(fk.constraintName)}
                            className="text-red-600 hover:text-red-700"
                            title="Drop foreign key"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Column</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Column Name
                  </label>
                  <input
                    type="text"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter column name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Type
                  </label>
                  <select
                    value={newColumn.type}
                    onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {columnTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newColumn.notNull}
                    onChange={(e) => setNewColumn({ ...newColumn, notNull: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">NOT NULL</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Value
                  </label>
                  <input
                    type="text"
                    value={newColumn.defaultValue}
                    onChange={(e) => setNewColumn({ ...newColumn, defaultValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Default value (optional)"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddColumn(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColumn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Foreign Key Modal */}
      {showAddForeignKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Foreign Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Column
                  </label>
                  <select
                    value={newForeignKey.column}
                    onChange={(e) => setNewForeignKey({ ...newForeignKey, column: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column</option>
                    {selectedTable?.columns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Table
                  </label>
                  <select
                    value={newForeignKey.referenceTable}
                    onChange={(e) => {
                      setNewForeignKey({ 
                        ...newForeignKey, 
                        referenceTable: e.target.value,
                        referenceColumn: ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select table</option>
                    {schemaData?.filter(table => table.name !== selectedTable?.name).map(table => (
                      <option key={table.name} value={table.name}>{table.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Column
                  </label>
                  <select
                    value={newForeignKey.referenceColumn}
                    onChange={(e) => setNewForeignKey({ ...newForeignKey, referenceColumn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!newForeignKey.referenceTable}
                  >
                    <option value="">Select column</option>
                    {newForeignKey.referenceTable && schemaData?.find(t => t.name === newForeignKey.referenceTable)?.columns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Constraint Name
                  </label>
                  <input
                    type="text"
                    value={newForeignKey.constraintName}
                    onChange={(e) => setNewForeignKey({ ...newForeignKey, constraintName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddForeignKey(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddForeignKey}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add Foreign Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaManager; 