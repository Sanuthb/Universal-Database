import React from "react";
import HomeSideBar from "../Components/HomeSideBar";
import ProjectContainer from "../Components/ProjectCreation/ProjectContainer";

const Home = () => {
  return (
    <div className="flex w-full h-full">
      <HomeSideBar />
      <ProjectContainer/>
  
    </div>
  );
};

export default Home;
