// src/components/Local Manager Dashboard/NotificationsPage.js
import React, { useEffect, useState } from 'react';
import LocManagerSidebar from './LocManagerSidebar';
import './LocManagerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";
import Papa from 'papaparse';

const NotificationsPage = () => {
  const [mitigation, setMitigation] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    Papa.parse('/data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data;
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        const message = randomRow["Mitigation"] || "No mitigation found.";
        setMitigation(message);
      },
      error: (err) => {
        console.error("Error loading mitigation data:", err);
        setMitigation("Failed to load mitigation data.");
      }
    });

    const saved = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(saved);
  }, []);

  const handleSendNotification = () => {
    const updated = [mitigation, ...notifications];
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    localStorage.setItem('notifications_sent', (parseInt(localStorage.getItem("notifications_sent") || "0") + 1).toString());
    setMitigation('');
  };

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
            <span className="location-text">Current Location: Amsterdam Brewery</span>
            <FiHelpCircle className="topbar-icon" />
            <FiBell className="topbar-icon" />
            <button className="report-button">View Daily Report</button>
          </div>
        </div>

        <h2>Notifications</h2>
        <h4>Suggested Mitigation Based on Today’s Heat Risk</h4>
        <div style={{ background: '#e0f7ff', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {mitigation}
        </div>

        <button className="report-button" onClick={handleSendNotification}>Send Notification</button>

        <h4 style={{ marginTop: '30px' }}>Sent Notifications</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.length === 0 ? (
            <p>No notifications sent yet.</p>
          ) : (
            notifications.map((note, index) => (
              <div key={index} style={{ background: '#fff3cd', padding: '10px', borderRadius: '6px' }}>
                {note}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;