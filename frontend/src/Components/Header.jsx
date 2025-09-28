import React from "react";
import { User,PanelRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../redux/Slice/sidebarslice";

const Header = () => {
    const dispatch = useDispatch();
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
      {/* Brand / App Title */}
      <button className="cursor-pointer" onClick={()=>{dispatch(toggleSidebar())}}><PanelRight /></button>

      {/* User Profile */}
      <div className="flex items-center gap-3 cursor-pointer">
        <User size={22} className="text-[var(--primary-color)]" />
        <span className="hidden sm:inline font-medium">My Account</span>
      </div>
    </header>
  );
};

export default Header;
