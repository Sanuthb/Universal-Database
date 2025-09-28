import React from "react";
import TopBar from "../Components/TopBar";
import Sidebar from "../Components/Sidebar";
import Maincontent from "../Components/Maincontent";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { connection } = useSelector((s) => s.db);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {connection?.connected ? <Sidebar />: ""}
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <Maincontent/>
      </div>
    </div>
  );
};

export default Dashboard;