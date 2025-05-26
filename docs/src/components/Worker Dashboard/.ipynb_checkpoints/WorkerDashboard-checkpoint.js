// WorkerDashboard.js
import React from 'react';
import WorkerSidebar from './WorkerSidebar';
import './WorkerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";
import { Routes, Route } from 'react-router-dom';

// Page imports
import CompanyProfilePage from './CompanyProfilePage';
import HeatStressMonitoringPage from './HeatStressMonitoringPage';
import TrainingPage from './TrainingPage';
import RewardsPage from './RewardsPage';
import SettingsPage from './SettingsPage';
import TutorialPage from './TutorialPage';
import ReportSymptomsPage from './ReportSymptomsPage';

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

        {/* Routing for the sidebar pages */}
        <Routes>
          <Route path="/" element={<div>Welcome to the Worker Dashboard</div>} />
          <Route path="company-profile" element={<CompanyProfilePage />} />
          <Route path="heat-stress-monitoring" element={<HeatStressMonitoringPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="tutorial" element={<TutorialPage />} />
          <Route path="report-symptoms" element={<ReportSymptomsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default WorkerDashboard;