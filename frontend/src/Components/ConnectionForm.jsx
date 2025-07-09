import React, { useState } from 'react';
import { Database, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const ConnectionForm = () => {
  const { connection, connect, loading, error, clearError } = useDatabaseContext();
  const [url, setUrl] = useState('');
  const [showForm, setShowForm] = useState(!connection);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const success = await connect(url);
    if (success) {
      setShowForm(false);
    }
  };

  const handleDisconnect = () => {
    setShowForm(true);
    setUrl('');
  };

  if (connection && !showForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Connected to Database</h3>
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Connect to Database</h3>
      </div>

      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label htmlFor="db-url" className="block text-sm font-medium text-gray-700 mb-2">
            Database URL
          </label>
          <input
            id="db-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="postgresql://username:password@localhost:5432/database"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: postgresql://username:password@host:port/database
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Connect
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ConnectionForm; 