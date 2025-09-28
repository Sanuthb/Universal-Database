import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Database,
  Key,
  Folder,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProject,
  fetchProjects,
  selectProject,
} from "../../redux/Slice/projectsSlice";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: projects, loading } = useSelector((s) => s.projects);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    databaseType: "",
    connectionString: "",
    dbName: "",
    serviceAccountJson: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.databaseType || !formData.connectionString) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      databaseType: formData.databaseType,
      connectionString: formData.connectionString,
      dbName: formData.dbName || undefined,
      serviceAccount: undefined, // No longer using JSON config
      extra: undefined,
    };

    const action = await dispatch(createProject(payload));
    if (createProject.fulfilled.match(action)) {
      setFormData({
        name: "",
        description: "",
        databaseType: "",
        connectionString: "",
        dbName: "",
        serviceAccountJson: "",
      });
      setShowForm(false);
    }
  };

  const maskApiKey = (key) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + "****" + key.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Folder className="text-[var(--primary-color)]" />
          Projects
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition"
        >
          <PlusCircle size={18} />
          {showForm ? "Cancel" : "New Project"}
        </button>
      </div>

      {/* Project Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. User Management"
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description..."
              className="w-full border rounded-lg p-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Database
            </label>
            <select
              name="databaseType"
              value={formData.databaseType}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">-- Choose Database --</option>
              <option value="postgres">Postgres/Neon/Supabase</option>
              <option value="mongodb">MongoDB</option>
              <option value="firebase">Firebase</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>

          {/* Connection String for all databases */}
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <Key size={16} /> Connection String
            </label>
            {formData.databaseType === 'firebase' && (
              <div className="mb-2 text-xs text-gray-600 bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                <div className="font-semibold text-orange-800 mb-1">🔥 Firebase Connection String Format:</div>
                <code className="text-sm bg-orange-100 p-2 rounded block break-all">
                  firebase://project-id:api-key@auth-domain/storage-bucket
                </code>
                <p className="text-xs text-orange-700 mt-2">
                  Example: firebase://serviceproviderapp-705f1:AIzaSyB0laPzHTkrVRfZPMLZw7U9oNxZWJihIAo@serviceproviderapp-705f1.firebaseapp.com/serviceproviderapp-705f1.firebasestorage.app
                </p>
              </div>
            )}
            <input
              type="text"
              name="connectionString"
              value={formData.connectionString}
              onChange={handleChange}
              placeholder={
                formData.databaseType === 'postgres' ? 'postgresql://user:pass@host:5432/db' :
                formData.databaseType === 'mongodb' ? 'mongodb+srv://user:pass@cluster.mongodb.net/db' :
                formData.databaseType === 'firebase' ? 'firebase://project-id:api-key@auth-domain/storage-bucket' :
                formData.databaseType === 'mysql' ? 'mysql://user:pass@host:3306/db' :
                'Enter connection string based on database type'
              }
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Database Name (optional)
            </label>
            <input
              type="text"
              name="dbName"
              value={formData.dbName}
              onChange={handleChange}
              placeholder="e.g. my_database"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Project"}
          </button>
        </form>
      )}

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects created yet.</p>
        ) : (
          projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white p-6 rounded-xl shadow space-y-2 cursor-pointer hover:shadow-md"
              onClick={() => {
                dispatch(selectProject(proj._id));
                navigate(`/projects/${proj._id}`);
              }}
            >
              <h3 className="text-lg font-semibold">{proj.name}</h3>
              <p className="text-gray-600 text-sm">{proj.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Database size={16} className="text-[var(--primary-color)]" />
                <span className="uppercase">{proj.connection?.type}</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <ExternalLink size={14} /> Click to open project dashboard
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
