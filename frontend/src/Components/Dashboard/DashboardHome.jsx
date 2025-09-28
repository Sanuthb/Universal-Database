import React from "react";
import { Database, FileCode, Folder, Activity, PlusCircle } from "lucide-react";

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-4">
          <Database className="text-[var(--primary-color)]" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Databases</h3>
            <p className="text-gray-500">3 Connected</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-4">
          <FileCode className="text-[var(--primary-color)]" size={32} />
          <div>
            <h3 className="text-lg font-semibold">APIs</h3>
            <p className="text-gray-500">12 Endpoints</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-4">
          <Folder className="text-[var(--primary-color)]" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Projects</h3>
            <p className="text-gray-500">4 Active</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-4">
          <Activity className="text-[var(--primary-color)]" size={32} />
          <div>
            <h3 className="text-lg font-semibold">Activity</h3>
            <p className="text-gray-500">5 Recent Logs</p>
          </div>
        </div>
      </div>

      {/* Database Connections */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Database Connections</h2>
          <button className="flex items-center gap-2 text-sm bg-[var(--primary-color)] text-white px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition">
            <PlusCircle size={18} />
            Add Database
          </button>
        </div>
        <ul className="space-y-3">
          <li className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
            <span className="font-medium">MongoDB</span>
            <span className="text-green-600 text-sm">Active</span>
          </li>
          <li className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
            <span className="font-medium">Postgres (Neon)</span>
            <span className="text-green-600 text-sm">Active</span>
          </li>
          <li className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
            <span className="font-medium">Firebase</span>
            <span className="text-red-600 text-sm">Disconnected</span>
          </li>
        </ul>
      </div>

      {/* API Explorer */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Recent APIs</h2>
        <ul className="space-y-2">
          <li className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
            <span className="font-mono text-sm">/api/v1/users</span>
            <button className="text-xs text-[var(--primary-color)] hover:underline">Copy</button>
          </li>
          <li className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
            <span className="font-mono text-sm">/api/v1/orders</span>
            <button className="text-xs text-[var(--primary-color)] hover:underline">Copy</button>
          </li>
          <li className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
            <span className="font-mono text-sm">/api/v1/products</span>
            <button className="text-xs text-[var(--primary-color)] hover:underline">Copy</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;
