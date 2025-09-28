import React from "react";
import Header from "../../Components/Header";
import DashboardSidebar from "../../Components/DashboardSidebar";
import { useSelector } from "react-redux";

// Import your components
import DashboardHome from "../../Components/Dashboard/DashboardHome";
import Documentation from "../../Components/Dashboard/Documentation";
import Projects from "../../Components/Dashboard/Projects";
import Settings from "../../Components/Dashboard/Settings";


const UserDashboard = () => {
  const activeComponent = useSelector((state) => state.componentLoad.ComponentLoad);

  const renderComponent = () => { 
    switch (activeComponent) {
      case "Dashboard":
        return <DashboardHome />;
      case "Documentation":
        return <Documentation />;
      case "Projects":
        return <Projects />;
      case "Settings":
        return <Settings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
