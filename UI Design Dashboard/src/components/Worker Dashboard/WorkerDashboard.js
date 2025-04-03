import React from 'react';
import WorkerSidebar from './WorkerSidebar';
import './WorkerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";
import { Outlet } from 'react-router-dom';

const WorkerDashboard = () => {
  return (
    <div className="worker-dashboard">
      <WorkerSidebar />
      <div className="worker-main-content">
        <div className="worker-topbar">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>
          <div className="topbar-right">
            <span className="location-text">Current Location: Monterrey Brewery</span>
            <FiHelpCircle className="topbar-icon" />
            <FiBell className="topbar-icon" />
            <a href="/worker/report-symptoms">
              <button className="report-button">Report Symptoms</button>
            </a>
          </div>
        </div>

        {/* This is where the subpages will be rendered */}
        <Outlet />
      </div>
    </div>
  );
};

export default WorkerDashboard;