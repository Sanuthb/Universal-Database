import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, RefreshCw, Loader2, Eye, EyeOff } from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const DataTable = ({ tableName }) => {
  const { 
    data, 
    loading, 
    error, 
    selectedTable,
    loadTableData, 
    insertTableData, 
    updateTableData, 
    deleteTableData,
    clearError 
  } = useDatabaseContext();

  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [insertData, setInsertData] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(new Set());

  useEffect(() => {
    if (selectedTable && selectedTable.name) {
      loadTableData(selectedTable.name);
      if (selectedTable.schema) {
        setVisibleColumns(new Set(selectedTable.schema.map(col => col.name)));
      }
    }
  }, [selectedTable, loadTableData]);

  useEffect(() => {
    if (data.length > 0 && selectedTable?.schema) {
      const allColumns = new Set(selectedTable.schema.map(col => col.name));
      setVisibleColumns(allColumns);
    }
  }, [data, selectedTable]);

  const handleEdit = (row) => {
    setEditingRow(row);
    setEditData({ ...row });
  };

  const handleSave = async () => {
    if (!editingRow || !tableName) return;

    const success = await updateTableData(tableName, editingRow.id, editData);
    if (success) {
      setEditingRow(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleDelete = async (row) => {
    if (!tableName || !confirm('Are you sure you want to delete this row?')) return;

    await deleteTableData(tableName, row.id);
  };

  const handleInsert = async () => {
    if (!tableName || !insertData) return;

    const success = await insertTableData(tableName, insertData);
    if (success) {
      setShowInsertForm(false);
      setInsertData({});
    }
  };

  const toggleColumnVisibility = (columnName) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnName)) {
        newSet.delete(columnName);
      } else {
        newSet.add(columnName);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-blue-700 font-medium">Loading...</span>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a table to view data
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
    );
  }

  const columns = selectedTable.schema || [];
  const visibleData = data.filter(row => 
    Object.keys(row).some(key => visibleColumns.has(key))
  );

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedTable.name} ({data.length} rows)
          </h3>
          <button
            onClick={() => loadTableData(tableName)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInsertForm(!showInsertForm)}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>
      </div>

      {/* Column visibility controls */}
      <div className="bg-gray-50 p-3 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Visible Columns:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {columns.map(column => (
            <button
              key={column.name}
              onClick={() => toggleColumnVisibility(column.name)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
                visibleColumns.has(column.name)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {visibleColumns.has(column.name) ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {column.name}
            </button>
          ))}
        </div>
      </div>

      {/* Insert Form */}
      {showInsertForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-3">Add New Row</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {columns.map(column => (
              <div key={column.name}>
                <label className="block text-xs font-medium text-blue-700 mb-1">
                  {column.name}
                </label>
                <input
                  type="text"
                  value={insertData[column.name] || ''}
                  onChange={(e) => setInsertData(prev => ({
                    ...prev,
                    [column.name]: e.target.value
                  }))}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={column.type}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInsert}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setShowInsertForm(false);
                setInsertData({});
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  visibleColumns.has(column.name) && (
                    <th
                      key={column.name}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.name}
                    </th>
                  )
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                visibleData.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50">
                    {columns.map(column => (
                      visibleColumns.has(column.name) && (
                        <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingRow === row ? (
                            <input
                              type="text"
                              value={editData[column.name] || ''}
                              onChange={(e) => setEditData(prev => ({
                                ...prev,
                                [column.name]: e.target.value
                              }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="truncate max-w-xs block">
                              {row[column.name]?.toString() || ''}
                            </span>
                          )}
                        </td>
                      )
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingRow === row ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable; 