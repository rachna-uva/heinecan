// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Worker Dashboard Pages
import WorkerDashboard from './components/Worker Dashboard/WorkerDashboard';
import CompanyProfilePage from './components/Worker Dashboard/CompanyProfilePage';
import HeatStressMonitoringPage from './components/Worker Dashboard/HeatStressMonitoringPage';
import TrainingPage from './components/Worker Dashboard/TrainingPage';
import RewardsPage from './components/Worker Dashboard/RewardsPage';
import SettingsPage from './components/Worker Dashboard/SettingsPage';
import TutorialPage from './components/Worker Dashboard/TutorialPage';
import ReportSymptomsPage from './components/Worker Dashboard/ReportSymptomsPage';

// Local Manager Dashboard
import LocManagerDashboard from './components/Local Manager Dashboard/LocManagerDashboard';

function App() {
  return (
    <Router>
      <Routes>

        {/* Default redirect to /worker */}
        <Route path="/" element={<Navigate to="/worker" replace />} />

        {/* Worker Dashboard + nested pages */}
        <Route path="/worker" element={<WorkerDashboard />}>
          <Route index element={<div>Welcome to the Worker Dashboard</div>} />
          <Route path="company-profile" element={<CompanyProfilePage />} />
          <Route path="heat-stress-monitoring" element={<HeatStressMonitoringPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="tutorial" element={<TutorialPage />} />
          <Route path="report-symptoms" element={<ReportSymptomsPage />} />
        </Route>

        {/* Local Manager Dashboard (standalone for now) */}
        <Route path="/local-manager" element={<LocManagerDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;