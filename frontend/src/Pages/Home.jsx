import React from "react";
import { Link } from "react-router-dom";
import { Database, Cable, Unlink } from "lucide-react";

const Home = () => {
  return (
    <div className="bg-gray-200 w-full h-screen relative">
      <div className="text-blue-500 absolute top-1/3 left-10 rotate-30 bg-white rounded-xl shadow shadow-gray-400 p-2 flex items-center justify-center  w-fit h-fit ">
        <Database />
      </div>
      <div className="text-green-500 absolute top-30 right-10 rotate-30 bg-white rounded-xl shadow shadow-gray-400 p-2 flex items-center justify-center  w-fit h-fit">
        <Cable />
      </div>
      <div className="text-red-500 absolute bottom-30 right-10 rotate-30 bg-white rounded-xl shadow shadow-gray-400 p-2 flex items-center justify-center  w-fit h-fit">
        <Unlink />
      </div>
      <div className="h-[calc(100vh-3rem)] w-full flex items-center justify-center flex-col gap-5">
        <h1 className="text-[#08072b] text-5xl font-bold text-center leading-18">
          Connect Any Database.<br></br>Manage Visually. No Backend Required.
        </h1>
        <p className="w-1/2 text-center text-gray-400 ">
          A universal database API connector that lets you read, write, and
          manage data from PostgreSQL, MongoDB, and more — all through an
          intuitive CMS interface.
        </p>
        <Link to="/login" className="bg-[#08072b] rounded p-2 text-white">
          Get Started
        </Link>
      </div>
      <div className="p-2 bg-white w-full text-center text-sm">
        Powered and Secured by{" "}
        <Link
          to="https://www.street2site.com/"
          className="underline text-[#ff8343]"
        >
          Street2Site
        </Link>
      </div>
    </div>
  );
};

export default Home;