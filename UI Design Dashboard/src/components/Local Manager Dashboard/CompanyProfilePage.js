// src/components/Local Manager Dashboard/CompanyProfilePage.js
import React from 'react';
import LocManagerSidebar from './LocManagerSidebar';
import './CompanyProfilePage.css'; 
import { FiEdit2 } from "react-icons/fi";

const CompanyProfilePage = () => {
  const user = {
    name: "Gabriella Rawles",
    email: "briellatjintjelaar@gmail.com",
    role: "Local Manager", 
    location: "Amsterdam Brewery",
    gender: "Female",
    country: "Netherlands",
    language: "English",
    timezone: "CET"
  };

  return (
    <div className="locmanager-dashboard">
      <LocManagerSidebar />
      <div className="locmanager-main-content company-profile-container">
        <div className="profile-header">
          <div className="profile-info">
            <img src="/avatar-placeholder.png" alt="avatar" className="profile-avatar" />
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className="role-badge">{user.role}</span>
              <span className="location-badge">{user.location}</span>
            </div>
          </div>
          <button className="edit-button"><FiEdit2 /> Edit</button>
        </div>

        <div className="profile-fields">
          <div className="field-group">
            <label>Full Name</label>
            <input type="text" value={user.name} readOnly />
          </div>
          <div className="field-group">
            <label>G</label>
            <input type="text" value={user.gender} readOnly />
          </div>
          <div className="field-group">
            <label>Country</label>
            <input type="text" value={user.country} readOnly />
          </div>
          <div className="field-group">
            <label>Language</label>
            <input type="text" value={user.language} readOnly />
          </div>
          <div className="field-group">
            <label>Time Zone</label>
            <input type="text" value={user.timezone} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;