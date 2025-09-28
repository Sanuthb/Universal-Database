import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Settings,
  Database,
  LogOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../redux/Slice/sidebarslice";
import { setComponentLoad } from "../redux/Slice/ComponentLoad";

const DashboardSidebar = () => {
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const activeComponent = useSelector((state) => state.componentLoad.ComponentLoad);
  const dispatch = useDispatch();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Documentation", icon: <BookOpen size={20} /> },
    { label: "Projects", icon: <FolderKanban size={20} /> },
    { label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className={`p-2 border-r-[.1rem] border-gray-300 ${
        isSidebarOpen ? "w-64" : "w-20"
      } h-screen bg-white flex flex-col shadow-lg transition-all duration-300`}
    >
      {/* Logo */}
      {isSidebarOpen ? (
        <div className="p-6 text-2xl font-bold flex items-center justify-center gap-2 text-[var(--primary-color)]">
          <Database className="text-blue-400" />
          Connecta
        </div>
      ) : (
        <div className="mb-10 text-2xl font-bold flex items-center justify-center gap-2 text-[var(--primary-color)]">
          <Database className="text-blue-400" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-4">
        {navItems.map((item) =>
          isSidebarOpen ? (
            <button
              key={item.label}
              onClick={() => dispatch(setComponentLoad(item.label))}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full text-left ${
                activeComponent === item.label
                  ? "bg-[var(--primary-color)] text-[var(--secondary-color)] font-semibold"
                  : "hover:bg-[var(--secondary-color)]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ) : (
            <button
              key={item.label}
              onClick={() => dispatch(setComponentLoad(item.label))}
              className={`flex items-center justify-center rounded-lg p-2 transition-all w-full ${
                activeComponent === item.label
                  ? "bg-[var(--primary-color)] text-[var(--secondary-color)] font-semibold"
                  : "hover:bg-[var(--secondary-color)]"
              }`}
            >
              {item.icon}
            </button>
          )
        )}
      </nav>

      {/* Toggle */}
      <button
        onClick={() => {
          dispatch(toggleSidebar());
        }}
        className="bg-gray-200 p-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer m-2"
      >
        <LogOut className={isSidebarOpen ? "-rotate-180" : "rotate-0"} />
        {isSidebarOpen && <span>Collapse menu</span>}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
