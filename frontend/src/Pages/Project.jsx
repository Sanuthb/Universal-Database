import React from 'react'
import ProjectSideBar from '../Components/ProjectCreation/PojectSideBar'
import ProjectSection from "../Components/ProjectCreation/PorjectSection"
import ProjectTables from "../Components/ProjectCreation/ProjectTables"

const Project = () => {
  const [activeTab, setActiveTab] = React.useState("dashboard");

  return (
    <div className="bg-[var(--primary-color)] h-[calc(94vh-11px)] w-full p-4 text-white flex items-center">
      <ProjectSideBar setActiveTab={setActiveTab} activeTab={activeTab} />
      {activeTab === "dashboard" ? <ProjectSection /> : <ProjectTables />}
    </div>
  );
};

export default Project;