import { Database, Loader2, RefreshCw, Plus, Table, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateTableForm from "./CreateTableForm";
import { fetchSchema, setSelectedTable, disconnect } from "../redux/Slice/dbSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { connection, tables, selectedTable, loading } = useSelector((s) => s.db);
  
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (connection?.connected) {
      dispatch(fetchSchema({ url: connection.url }));
    }
  }, [connection, dispatch]);

  const handleRefresh = () => {
    if (connection?.connected) {
      dispatch(fetchSchema({ url: connection.url }));
    }
  };

  const handleTableSelect = (table) => {
    dispatch(setSelectedTable(table));
  };

  const handleDropTable = async (tableName) => {
    if (confirm(`Are you sure you want to drop table "${tableName}"? This action cannot be undone.`)) {
      await dropTable(tableName);
    }
  };

  const handleDisconnect = () => {
    dispatch(disconnect());
  };

  if (!connection?.connected) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-400">Database</span>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            Not connected
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Database className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Connect to a database to view tables</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Database</span>
          </div>
          <div className="text-xs text-gray-500 mb-3 break-all">
            {connection.type} connection
          </div>
          <div className="text-xs text-gray-400 truncate">
            {connection.url}
          </div>
        </div>

        <div className="space-y-2 px-2 py-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-2 rounded cursor-pointer shadow shadow-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded bg-blue-600 text-white w-full flex items-center justify-center gap-2 p-2 cursor-pointer shadow shadow-gray-400 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Table
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tables ({tables.length})</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                No tables found
              </div>
            ) : (
              <div className="space-y-1">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className={`group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedTable?.name === table.name ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => handleTableSelect(table)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Table className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {table.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropTable(table.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-1"
                      title="Drop table"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
          >
            <Database className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateTableForm onClose={() => setShowCreateForm(false)} />
      )}
    </>
  );
};

export default Sidebar;
