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
    setNotifications(saved.map((note) => ({ message: note, actionTaken: false })));
  }, []);

  const handleSendNotification = () => {
    if (!mitigation || mitigation === "No mitigation found." || mitigation === "Failed to load mitigation data.") {
      return;
    }

    const updated = [{ message: mitigation, actionTaken: false }, ...notifications];
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated.map(n => n.message)));
    localStorage.setItem('notifications_sent', (parseInt(localStorage.getItem("notifications_sent") || "0") + 1).toString());
    setMitigation('');
  };

  const handleCheckboxChange = (index) => {
    const updated = [...notifications];
    updated[index].actionTaken = !updated[index].actionTaken;
    setNotifications(updated);
  };

  const handleClearNotifications = () => {
    const remaining = notifications.filter(n => !n.actionTaken);
    if (remaining.length !== notifications.length) {
      alert("Only notifications with 'Action Taken' checked were removed.");
    }
    setNotifications(remaining);
    localStorage.setItem('notifications', JSON.stringify(remaining.map(n => n.message)));
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <p>No notifications sent yet.</p>
          ) : (
            notifications.map((note, index) => (
              <div key={index} style={{ background: '#fff3cd', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{note.message}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={note.actionTaken}
                    onChange={() => handleCheckboxChange(index)}
                  />
                  Action Taken
                </label>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            className="report-button"
            style={{ backgroundColor: '#ff4d4f' }}
            onClick={handleClearNotifications}
          >
            Clear Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
