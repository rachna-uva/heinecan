// src/components/Local Manager Dashboard/LocManagerDashboard.js
import React, { useEffect, useState } from 'react';
import LocManagerSidebar from './LocManagerSidebar';
import './LocManagerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";
import Chart from 'chart.js/auto';

let utciChartInstance = null;

const LocManagerDashboard = () => {
  const [data, setData] = useState({
    temperature: '',
    humidity: '',
    utci: '',
    heatStress: '',
    mitigation: '',
  });

  useEffect(() => {
    fetch('/data.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.trim().split('\n').slice(1);
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        const [temp, humidity, , utci, heatStress, , mitigation] = randomRow.split(',');

        setData({
          temperature: temp,
          humidity: humidity,
          utci,
          heatStress,
          mitigation
        });

        // Chart logic
        const ctx = document.getElementById('utciChart');
        if (ctx) {
          const trendRows = rows.slice(0, 7).map(r => parseFloat(r.split(',')[3]));

          // Destroy old chart instance
          if (utciChartInstance) {
            utciChartInstance.destroy();
          }

          // Create new chart instance
          utciChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [
                {
                  label: 'UTCI (Bar)',
                  data: trendRows,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                  label: 'UTCI (Line)',
                  data: trendRows,
                  type: 'line',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 2,
                  pointRadius: 4,
                  fill: false
                }
              ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, 
                aspectRatio: 2, 
                scales: {
                    y: {
                        min: 20,
                        max: 50,
                        title: { display: true, text: 'UTCI Value' }
                    },
                    x: {
                        title: { display: true, text: 'Day of the Week' }
                    }
                }
            }
          });
        }
      });
  }, []);

    const getRiskColorClass = (risk) => {
      if (risk.includes("No Thermal Stress")) return "low-risk";
      if (risk.includes("Moderate Thermal Stress")) return "moderate-risk";
      if (risk.includes("Strong Thermal Stress")) return "high-risk";
      if (risk.includes("Very Strong Thermal Stress") || risk.includes("Extreme Thermal Stress")) return "extreme-risk";
      return "";
    };

  return (
    <div className="locmanager-dashboard">
      <LocManagerSidebar />
      <div className="locmanager-main-content">
        {/* Top Bar */}
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

        {/* Main Cards */}
        <div className="dashboard-cards">
            <div className={`card heat-risk-card ${getRiskColorClass(data.heatStress)}`}>
                <h4>Heat Stress Risk Level</h4>
                <p>{data.heatStress}</p>
            </div>
          <div className="card">
            <h4>Temperature</h4>
            <p>{data.temperature} °C</p>
          </div>
          <div className="card">
            <h4>Humidity</h4>
            <p>{data.humidity} %</p>
          </div>
        </div>

        {/* Chart Section */}
<div className="chart-container">
  <h3>Heat Risk Trend</h3>
  <div className="chart-wrapper">
    <canvas id="utciChart"></canvas>
  </div>
</div>

        {/* Mitigation Measures */}
        <div className="mitigation-panel">
          <h3 className="mitigation-title">Mitigation Measures</h3>
          <div className="mitigation-card">
            <table className="mitigation-table">
              <thead>
                <tr>
                  <th>Condition</th>
                  <th>Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.heatStress}</td>
                  <td>{data.mitigation}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocManagerDashboard;