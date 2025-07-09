import React from "react";
import TopBar from "../Components/TopBar";
import Sidebar from "../Components/Sidebar";
import Maincontent from "../Components/Maincontent";
import { useDatabaseContext } from "../contexts/DatabaseContext";

const Dashboard = () => {
  const {connection} = useDatabaseContext();

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
