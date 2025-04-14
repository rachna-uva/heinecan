import React, { useEffect, useRef, useState } from 'react';
import LocManagerSidebar from './LocManagerSidebar';
import './LocManagerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";
import Chart from 'chart.js/auto';

const LocManagerDashboard = () => {
  const [data, setData] = useState({
    temperature: '',
    humidity: '',
    utci: '',
    heatStress: '',
    mitigation: ''
  });
  const [showUTCI, setShowUTCI] = useState(true);

  const utciChartRef = useRef(null);
  const tempHumidityChartRef = useRef(null);
  const utciChartInstance = useRef(null);
  const tempHumidChartInstance = useRef(null);

  useEffect(() => {
    fetch('/data.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.trim().split('\n').slice(1);
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        const [temp, humidity, , utci, heatStress, , mitigation] = randomRow.split(',');

        setData({ temperature: temp, humidity, utci, heatStress, mitigation });

        const trendRows = [];
        const usedIndices = new Set();
        while (trendRows.length < 7 && usedIndices.size < rows.length) {
          const i = Math.floor(Math.random() * rows.length);
          if (!usedIndices.has(i)) {
            usedIndices.add(i);
            trendRows.push(rows[i]);
          }
        }

        const utciGroups = trendRows.map(row => {
          const val = parseFloat(row.split(',')[3]);
          if (val <= 20) return 1;
          if (val <= 30) return 2;
          if (val <= 40) return 3;
          return 4;
        });

        const temperatureData = trendRows.map(row => parseFloat(row.split(',')[0]));
        const humidityData = trendRows.map(row => parseFloat(row.split(',')[1]));

        if (utciChartInstance.current) utciChartInstance.current.destroy();
        if (tempHumidChartInstance.current) tempHumidChartInstance.current.destroy();

        if (utciChartRef.current) {
          utciChartInstance.current = new Chart(utciChartRef.current, {
            type: 'line',
            data: {
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{
                label: 'Heat Risk (Line)',
                data: utciGroups,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 4,
                fill: false
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  min: 1,
                  max: 4,
                  ticks: {
                    stepSize: 1,
                    callback: value => `${value}`
                  },
                  title: { display: true, text: 'Heat Risk Level' }
                },
                x: { title: { display: true, text: 'Day of the Week' } }
              }
            }
          });
        }

        if (tempHumidityChartRef.current) {
          tempHumidChartInstance.current = new Chart(tempHumidityChartRef.current, {
            type: 'line',
            data: {
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [
                {
                  label: 'Temperature (°C)',
                  data: temperatureData,
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  tension: 0.4
                },
                {
                  label: 'Humidity (%)',
                  data: humidityData,
                  borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  tension: 0.4
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Values' } },
                x: { title: { display: true, text: 'Day of the Week' } }
              }
            }
          });
        }
      });
  }, [showUTCI]);

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

        {/* Dashboard Cards */}
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
            {showUTCI ? (
              <canvas ref={utciChartRef} id="utciChart"></canvas>
            ) : (
              <canvas ref={tempHumidityChartRef} id="tempHumidityChart"></canvas>
            )}
          </div>
        
          {/* Move Switch Graph button below the chart */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={() => setShowUTCI(!showUTCI)} className="report-button">
              Switch Graph
            </button>
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