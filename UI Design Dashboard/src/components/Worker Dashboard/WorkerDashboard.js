import React, { useEffect, useState } from 'react';
import WorkerSidebar from './WorkerSidebar';
import './WorkerDashboard.css';
import { FiSearch, FiHelpCircle, FiBell } from "react-icons/fi";
import Chart from 'chart.js/auto';

let workerChartInstance = null;

const WorkerDashboard = () => {
  const [data, setData] = useState({
    temperature: '',
    humidity: '',
    utci: '',
    heatStress: '',
    mitigation: '',
  });

  const [coolingTime, setCoolingTime] = useState(1800); // 30 minutes

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

        const ctx = document.getElementById('workerChart');
        if (ctx) {
          const trendRows = rows.slice(0, 7).map(r => parseFloat(r.split(',')[3]));

          if (workerChartInstance) {
            workerChartInstance.destroy();
          }

          workerChartInstance = new Chart(ctx, {
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCoolingTime(prev => (prev > 0 ? prev - 1 : 1800)); // reset after reaching 0
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRiskColorClass = (risk) => {
    if (risk.includes("No Thermal Stress")) return "low-risk";
    if (risk.includes("Moderate Thermal Stress")) return "moderate-risk";
    if (risk.includes("Strong Thermal Stress")) return "high-risk";
    if (risk.includes("Very Strong Thermal Stress") || risk.includes("Extreme Thermal Stress")) return "extreme-risk";
    return "";
  };

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
          <div className="card">
            <h4>Next Cooling Break</h4>
            <p>{formatTime(coolingTime)}</p>
          </div>
        </div>

        {/* Heat Risk Trend Chart */}
        <div className="chart-container">
          <h3>Heat Risk Trend</h3>
          <div className="chart-wrapper">
            <canvas id="workerChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;