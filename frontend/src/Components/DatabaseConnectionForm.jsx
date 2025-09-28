import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDatabaseContext } from '../contexts/DatabaseContext';
import { testConnection } from '../redux/Slice/dbSlice';
import { Database, Loader, CheckCircle, XCircle, Info } from 'lucide-react';

const DatabaseConnectionForm = ({ onConnect }) => {
  const dispatch = useDispatch();
  const { connect, loading, error, supportedDatabases, fetchSupportedDatabases } = useDatabaseContext();
  const [connectionString, setConnectionString] = useState('');
  const [selectedDbType, setSelectedDbType] = useState('postgresql');
  const [showExamples, setShowExamples] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    fetchSupportedDatabases();
  }, [fetchSupportedDatabases]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnectionStatus(null);
    
    // Connect using DatabaseContext
    const success = await connect(connectionString);
    
    if (success) {
      setConnectionStatus('success');
      
      // Also update Redux store for app-wide state sync
      await dispatch(testConnection({ url: connectionString }));
      
      if (onConnect) {
        onConnect();
      }
    } else {
      setConnectionStatus('error');
    }
  };

  const handleDatabaseTypeChange = (type) => {
    setSelectedDbType(type);
    setConnectionString('');
    setConnectionStatus(null);
  };

  const getConnectionStringPlaceholder = (type) => {
    if (!supportedDatabases?.examples) return '';
    return supportedDatabases.examples[type] || '';
  };

  const getDatabaseTypeInfo = (type) => {
    const info = {
      postgresql: {
        name: 'PostgreSQL / NeonDB',
        description: 'Supports all PostgreSQL-compatible databases including NeonDB',
        features: ['Full SQL support', 'ACID transactions', 'Advanced queries', 'Foreign keys']
      },
      mongodb: {
        name: 'MongoDB',
        description: 'NoSQL document database with flexible schema',
        features: ['Document storage', 'Dynamic schema', 'Horizontal scaling', 'Rich queries']
      },
      firebase: {
        name: 'Firebase Firestore',
        description: 'Google\'s NoSQL cloud database with real-time sync',
        features: ['Real-time updates', 'Offline support', 'Auto-scaling', 'Built-in security']
      },
      supabase: {
        name: 'Supabase',
        description: 'Open-source Firebase alternative with PostgreSQL',
        features: ['PostgreSQL power', 'Real-time subscriptions', 'Row-level security', 'Built-in auth']
      }
    };
    return info[type] || {};
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Connect to Database</h2>
      </div>

      {/* Database Type Selection */}
      {supportedDatabases?.supportedTypes && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Database Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportedDatabases.supportedTypes.map((type) => {
              const dbInfo = getDatabaseTypeInfo(type);
              return (
                <div
                  key={type}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDbType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDatabaseTypeChange(type)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{dbInfo.name}</h3>
                    <input
                      type="radio"
                      checked={selectedDbType === type}
                      onChange={() => handleDatabaseTypeChange(type)}
                      className="text-blue-600"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{dbInfo.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {dbInfo.features?.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection String Input */}
      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connection String
          </label>
          {selectedDbType === 'firebase' && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🔥 Firebase Connection String Format:</h4>
              <code className="text-sm bg-yellow-100 p-2 rounded block break-all">
                firebase://serviceproviderapp-705f1:AIzaSyB0laPzHTkrVRfZPMLZw7U9oNxZWJihIAo@serviceproviderapp-705f1.firebaseapp.com/serviceproviderapp-705f1.firebasestorage.app
              </code>
              <p className="text-xs text-yellow-700 mt-2">
                Format: firebase://[project-id]:[api-key]@[auth-domain]/[storage-bucket]
              </p>
            </div>
          )}
          <input
            type="text"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder={getConnectionStringPlaceholder(selectedDbType)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        {/* Show Examples Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Info className="w-4 h-4" />
            {showExamples ? 'Hide' : 'Show'} connection examples
          </button>
        </div>

        {/* Connection Examples */}
        {showExamples && supportedDatabases?.examples && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Connection String Examples:</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(supportedDatabases.examples).map(([type, example]) => (
                <div key={type} className="flex flex-col">
                  <span className="font-medium text-gray-700 capitalize">{type}:</span>
                  <code className="bg-white p-2 rounded border text-xs break-all">
                    {example}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Success Display */}
        {connectionStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">Successfully connected to database!</span>
          </div>
        )}

        {/* Connect Button */}
        <button
          type="submit"
          disabled={loading || !connectionString.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Database className="w-5 h-5" />
              Connect to Database
            </>
          )}
        </button>
      </form>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure your database is accessible from this application</li>
          <li>• For cloud databases, check that your IP is whitelisted</li>
          <li>• Ensure the connection string includes all required parameters</li>
          <li>• For Firebase, use the format: firebase://project-id:api-key@auth-domain/storage-bucket</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseConnectionForm;