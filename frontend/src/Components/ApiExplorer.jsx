import React, { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { useSelector } from "react-redux";

const ApiExplorer = () => {
  const { connection, tables, selectedTable } = useSelector((s) => s.db);
  const { items: projects } = useSelector((s) => s.projects);

  const currentProject = useMemo(() => {
    if (!connection?.url) return null;
    // Best-effort: find a project that matches the current connection url
    return projects.find((p) => p?.connection?.url === connection.url) || null;
  }, [projects, connection]);

  if (!currentProject) {
    return null;
  }

  // Support API key URLs too: http://localhost:9000/<apikey>/<project>/<table>
  const apiBase = window.location.origin.replace("5173", "9000");
  const token = localStorage.getItem("token");
  const apiKey = null; // fetched in Settings; user can paste it into clients

  const [method, setMethod] = useState("GET");

  const base = `${apiBase}/<api_key>/${encodeURIComponent(
    currentProject.name || currentProject._id
  )}`;

  const make = (t) => ({
    list: `${base}/${t}`,
    insert: `${base}/${t}`,
    update: `${base}/${t}/:id`,
    remove: `${base}/${t}/:id`,
  });

  const endpoints = selectedTable
    ? { [selectedTable.name]: make(selectedTable.name) }
    : Object.fromEntries((tables || []).map((t) => [t.name, make(t.name)]));

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 p-4 mt-4 ">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold text-gray-900">API Endpoints</h3>
        <div className="text-xs text-gray-500">
          Project: {currentProject.name || currentProject._id}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <label className="text-sm text-gray-700">Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`
      border rounded p-1 text-[.6rem] font-bold
      ${method === "GET" ? "text-green-500" : ""}
      ${method === "POST" ? "text-yellow-500" : ""}
      ${method === "PATCH" ? "text-violet-500" : ""}
      ${method === "DELETE" ? "text-red-500" : ""}
    `}
          >
            <option value="GET" className="text-green-500 font-bold">GET</option>
            <option value="POST" className="text-yellow-500 font-bold">POST</option>
            <option value="PATCH" className="text-violet-500 font-bold">PATCH</option>
            <option value="DELETE" className="text-red-500 font-bold">DELETE</option>
          </select>
        </div>
        <div className="">
          {Object.entries(endpoints).map(([tableName, e]) => (
            <div key={tableName} className="border rounded p-1">
              <div className="text-sm space-y-2">
                {method === "GET" && (
                  <div className="flex items-center justify-between">
                    <code className="bg-gray-50 text-[.6rem] w-65  rounded">
                      {e.list}
                    </code>
                    <button
                      onClick={() => copy(e.list)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {method === "POST" && (
                  <div className="flex items-center justify-between">
                    <code className="bg-gray-50 text-[.6rem] w-65  rounded">
                      {e.insert}
                    </code>
                    <button
                      onClick={() => copy(e.insert)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {method === "PATCH" && (
                  <div className="flex items-center justify-between ">
                    <code className="bg-gray-50 text-[.6rem] w-65  rounded">
                      {e.update}
                    </code>
                    <button
                      onClick={() => copy(e.update)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {method === "DELETE" && (
                  <div className="flex items-center justify-between">
                    <code className="bg-gray-50 text-[.6rem] w-65  rounded">
                      {e.remove}
                    </code>
                    <button
                      onClick={() => copy(e.remove)}
                      className="text-gray-500 hover:text-gray-700 z-10 bg-white h-full"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiExplorer;
