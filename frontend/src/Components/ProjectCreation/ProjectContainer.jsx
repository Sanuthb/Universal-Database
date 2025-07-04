import React from "react";
import Button from "../UI/Button";
import { useState } from "react";
import PopUp from "../UI/PopUp";
import Table from "../UI/Table";

const ProjectContainer = () => {
    const [toggle, setToggle] = useState(false);
    const handleToggle = () => {
    setToggle(!toggle);
    }

  return (
    <div className="w-[calc(100vw-16.6667%)] h-[calc(94vh-11px)] bg-[var(--primary-color)] p-4 border-r-2 border-[var(--border-color)] text-white">
      <div className="flex items-center justify-between">
      <h1 className="text-[2rem]">Your Projects </h1>
        <Button text={"New Project"} handleToggle={handleToggle}/>
      </div>
      {toggle && (<PopUp handleToggle={handleToggle}/>)}
      <Table/>
    </div>
  );
};

export default ProjectContainer;
