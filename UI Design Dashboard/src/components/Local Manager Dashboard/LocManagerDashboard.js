// src/components/Local Manager Dashboard/LocManagerDashboard.js
import React, { useEffect, useState } from 'react';
import LocManagerSidebar from './LocManagerSidebar';
import './LocManagerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";

const LocManagerDashboard = () => {
  const [data, setData] = useState({
    temperature: 'Loading...',
    humidity: 'Loading...',
    windSpeed: 'Loading...',
    utci: 'Loading...',
    heatStress: 'Loading...',
  });

  useEffect(() => {
    fetch('/data.csv') // Make sure data.csv is in your /public folder
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const row = lines[1].split(','); // get first data row
        setData({
          temperature: row[0],
          humidity: row[1],
          windSpeed: row[2],
          utci: row[3],
          heatStress: row[4],
        });
      });
  }, []);

  return (
    <div className="locmanager-dashboard">
      <LocManagerSidebar />
      <div className="locmanager-main-content">
        <div className="locmanager-topbar">
          <div className="locmanager-search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>
          <div className="topbar-right">
            <span>Current Location: Amsterdam Brewery</span>
            <FiHelpCircle className="topbar-icon" />
            <FiBell className="topbar-icon" />
            <button className="report-button">View Daily Report</button>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="card"><h4>Heat Stress Risk Level</h4><p>{data.heatStress}</p></div>
          <div className="card"><h4>Temperature</h4><p>{data.temperature} °C</p></div>
          <div className="card"><h4>Humidity</h4><p>{data.humidity} %</p></div>
          <div className="card"><h4>Wind Speed</h4><p>{data.windSpeed} km/h</p></div>
        </div>
      </div>
    </div>
  );
};

export default LocManagerDashboard;