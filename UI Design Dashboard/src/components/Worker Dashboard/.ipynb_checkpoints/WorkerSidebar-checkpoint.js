// src/components/WorkerDashboard/WorkerSidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './WorkerDashboard.css';

const WorkerSidebar = () => {
  const location = useLocation();

  const getLinkClass = (targetPath) => {
    return location.pathname === targetPath ? 'sidebar-link active' : 'sidebar-link';
  };

  return (
    <div className="worker-sidebar">
      <div className="sidebar-logo">
        <span role="img" aria-label="logo">🌡️</span> HSMD.
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">MENU</div>
        <ul>
          <li><Link to="/worker" className={getLinkClass('/worker')}>Dashboard</Link></li>
          <li><Link to="/worker/company-profile" className={getLinkClass('/worker/company-profile')}>Company Profile</Link></li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">ANALYTICS</div>
        <ul>
          <li><Link to="/worker/heat-stress-monitoring" className={getLinkClass('/worker/heat-stress-monitoring')}>Heat Stress Monitoring</Link></li>
          <li><Link to="/worker/training" className={getLinkClass('/worker/training')}>Training</Link></li>
          <li><Link to="/worker/rewards" className={getLinkClass('/worker/rewards')}>Rewards</Link></li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">HELP</div>
        <ul>
          <li><Link to="/worker/settings" className={getLinkClass('/worker/settings')}>Settings</Link></li>
          <li><Link to="/worker/tutorial" className={getLinkClass('/worker/tutorial')}>Tutorial</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default WorkerSidebar;