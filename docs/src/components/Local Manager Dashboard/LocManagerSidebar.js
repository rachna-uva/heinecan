// src/components/Local Manager Dashboard/LocManagerSidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './LocManagerDashboard.css';

const LocManagerSidebar = () => {
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
          <li><Link to="/local-manager" className={getLinkClass('/local-manager')}>Dashboard</Link></li>
          <li><Link to="/local-manager/company-profile" className={getLinkClass('/local-manager/company-profile')}>Company Profile</Link></li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">ANALYTICS</div>
        <ul>
          <li><Link to="/local-manager/zone-monitoring" className={getLinkClass('/local-manager/zone-monitoring')}>Zone Monitoring</Link></li>
          <li><Link to="/local-manager/performance-metrics" className={getLinkClass('/local-manager/performance-metrics')}>Performance Metrics</Link></li>
          <li><Link to="/local-manager/rewards" className={getLinkClass('/local-manager/rewards')}>Rewards</Link></li>
          <li><Link to="/local-manager/alerts" className={getLinkClass('/local-manager/alerts')}>Alerts & Notifications</Link></li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">HELP</div>
        <ul>
          <li><Link to="/local-manager/settings" className={getLinkClass('/local-manager/settings')}>Settings</Link></li>
          <li><Link to="/local-manager/tutorial" className={getLinkClass('/local-manager/tutorial')}>Tutorial</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default LocManagerSidebar;