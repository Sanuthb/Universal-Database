import React from "react";
import Badge from "./UI/Badge";
import { Unplug, Database } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { disconnect } from "../redux/Slice/dbSlice";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const dispatch = useDispatch();
  const { connection, selectedTable } = useSelector((s) => s.db);
  const navigate = useNavigate();

  const handleDisconnect = () => {
    dispatch(disconnect());
    navigate("/dashboard");
  };

  return (
    <header className="shadow-gray-300 shadow h-16 border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-black">
          Connecta
        </h1>
        
        {connection?.connected ? (
          <>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <Badge
                connected={true}
                className="bg-green-100 text-green-800 px-2 py-1 rounded"
              >
                Connected
              </Badge>
              <span className="text-sm text-gray-500 capitalize">
                {connection.type === 'postgresql' ? 'PostgreSQL' : 
                 connection.type === 'mongodb' ? 'MongoDB' :
                 connection.type === 'firebase' ? 'Firebase' :
                 connection.type === 'supabase' ? 'Supabase' :
                 connection.type}
              </span>
            </div>
            
            {selectedTable && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">→</span>
                <Badge>{selectedTable.name}</Badge>
                <span className="text-xs text-gray-400">
                  ({selectedTable.type || 'table'})
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-400" />
            <Badge
              connected={false}
              className="bg-gray-100 text-gray-800 px-2 py-1 rounded"
            >
              Not Connected
            </Badge>
          </div>
        )}
      </div>

      {connection?.connected && (
        <button 
          onClick={handleDisconnect}
          className="bg-white shadow cursor-pointer shadow-gray-300 rounded flex items-center gap-2 p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Unplug className="h-4 w-4 mr-2" />
          Disconnect
        </button>
      )}
    </header>
  );
};

export default TopBar;
