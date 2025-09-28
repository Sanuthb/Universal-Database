import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // ⬅ add useNavigate
import Header from "../../Components/Header";
import DashboardSidebar from "../../Components/DashboardSidebar";
import Sidebar from "../../Components/Sidebar";
import TopBar from "../../Components/TopBar";
import Maincontent from "../../Components/Maincontent";
import { fetchProjects } from "../../redux/Slice/projectsSlice";
import { fetchSchema, testConnection, disconnect } from "../../redux/Slice/dbSlice";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ⬅ initialize navigate
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.projects);
  const { connection } = useSelector((s) => s.db);

  const project = items.find((p) => p._id === id);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProjects());
    }
  }, [dispatch, project]);

  // Hydrate DB connection from project when available
  useEffect(() => {
    const url = project?.connection?.url;
    const projectType = project?.connection?.type;
    
    // Only connect if we have a project URL and it's different from current connection
    if (url && project?._id && connection?.url !== url) {
      console.log(`Switching to ${projectType} database:`, url);
      
      // Prevent multiple rapid connection attempts
      const connectToDatabase = async () => {
        try {
          // First disconnect from any existing connection
          if (connection?.connected) {
            console.log('Disconnecting from previous database...');
            await dispatch(disconnect()).unwrap();
          }
          
          // Connect to new database
          await dispatch(testConnection({ url })).unwrap();
          console.log('Connection successful, fetching schema...');
          await dispatch(fetchSchema({ url })).unwrap();
        } catch (error) {
          console.error('Connection failed:', error.message || error);
        }
      };
      
      connectToDatabase();
    }
  }, [dispatch, project?._id, project?.connection?.url]); // Only depend on project ID and URL

  // 🚨 Redirect if disconnected
  useEffect(() => {
    if (connection && connection.connected === false) {
      navigate("/dashboard"); // redirect to Dashboard
    }
  }, [connection, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Reuse same layout/logic as Dashboard */}
      {connection?.connected ? <Sidebar /> : null}

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <Maincontent />
      </div>
    </div>
  );
};

export default ProjectWorkspace;
