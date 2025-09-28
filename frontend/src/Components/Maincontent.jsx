import React, { useState } from "react";
import { Database, Settings } from "lucide-react";
import { useSelector } from "react-redux";
// Removed ConnectionForm per request
import DataTable from "./DataTable";
import SchemaManager from "./SchemaManager";
import ApiExplorer from "./ApiExplorer";

const Maincontent = () => {
  const { connection, selectedTable } = useSelector((s) => s.db);
  const [showSchemaManager, setShowSchemaManager] = useState(false);

  if (!connection?.connected) {
    return null;
  }

  if (!selectedTable) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Table
          </h3>
          <p className="text-gray-600">
            Choose a table from the sidebar to view and manage its data.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 p-6">
      {showSchemaManager ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Schema Manager
            </h2>
            <button
              onClick={() => setShowSchemaManager(false)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Data View
            </button>
          </div>
          <SchemaManager />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTable.name}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSchemaManager(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white shadow cursor-pointer text-blue-700 rounded-md hover:shadow-gray-300"
              >
                <Settings className="h-4 w-4" />
                Schema Manager
              </button>
              <ApiExplorer />
            </div>
          </div>
          <DataTable tableName={selectedTable.name} />
        </>
      )}
    </main>
  );
};

export default Maincontent;
