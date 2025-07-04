import React from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { TbTableSpark } from "react-icons/tb";

const ProjectSideBar = ({ setActiveTab, activeTab }) => {
  return (
    <div className="w-1/6 h-[calc(94vh-11px)] border-r-2 border-[var(--border-color)] py-5 px-2 flex flex-col gap-5">
      <div className="flex flex-col items-start gap-4 w-full">
        <h5 className="text-xs font-medium">PROJECT</h5>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`cursor-pointer text-left text-lg hover:bg-[var(--accent-color)] p-2 w-full rounded flex items-center gap-2 ${
            activeTab === "dashboard" ? "bg-[var(--accent-color)]" : ""
          }`}
        >
          <MdOutlineSpaceDashboard /> Dashboard
        </button>
      </div>

      <div className="flex flex-col items-start gap-4 w-full">
        <h5 className="text-xs font-medium">BRANCH</h5>
        <button
          onClick={() => setActiveTab("table")}
          className={`cursor-pointer text-left text-lg hover:bg-[var(--accent-color)] p-2 w-full rounded flex items-center gap-2 ${
            activeTab === "table" ? "bg-[var(--accent-color)]" : ""
          }`}
        >
          <TbTableSpark /> Tables
        </button>
      </div>
    </div>
  );
};

export default ProjectSideBar;
