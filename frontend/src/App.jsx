import React from 'react';
import {Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/Users/UserDashboard';
import ProjectWorkspace from './pages/Users/ProjectWorkspace';

const App = () => {

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboardb" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
  )
};

export default App;
