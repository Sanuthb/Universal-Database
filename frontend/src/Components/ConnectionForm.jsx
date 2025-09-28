import React, { useState } from "react";
import { Database, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearDbError, testConnection } from "../redux/Slice/dbSlice";
import DatabaseConnectionForm from "./DatabaseConnectionForm";

const ConnectionForm = () => {
  const dispatch = useDispatch();
  const { connection, loading, error } = useSelector((s) => s.db);
  const [showForm, setShowForm] = useState(!connection);

  const handleConnect = async () => {
    setShowForm(false);
  };

  const handleDisconnect = () => {
    setShowForm(true);
  };

  if (connection && !showForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">
                Connected to {connection.type ? connection.type.charAt(0).toUpperCase() + connection.type.slice(1) : 'Database'}
              </h3>
              <p className="text-sm text-gray-500 truncate max-w-md">
                {connection.url}
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return <DatabaseConnectionForm onConnect={handleConnect} />;
};

export default ConnectionForm;
