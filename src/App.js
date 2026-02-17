import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DistrictsPage from './pages/DistrictsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FactorsPage from './pages/FactorsPage';
import ClustersPage from './pages/ClustersPage';
import StatesPage from './pages/StatesPage';
import EarlyMoversPage from './pages/EarlyMoversPage';
import MapsPage from './pages/MapsPage';


import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/districts" element={<DistrictsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/factors" element={<FactorsPage />} />
        <Route path="/clusters" element={<ClustersPage />} />
        <Route path="/states" element={<StatesPage />} />
        <Route path="/earlymovers" element={<EarlyMoversPage />} />
        <Route path="/maps" element={<MapsPage />} />
      </Routes>
    </Router>
  );
}

export default App;