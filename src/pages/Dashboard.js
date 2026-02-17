import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, PieChart, Pie, Legend } from 'recharts';
import './Dashboard.css';

const getClusterColor = (clusterName) => {
  const colors = {
    'Metro Hubs': '#00d4ff',
    'MSME Strongholds': '#ff00a8',
    'Emerging Markets': '#2ed573',
    'Infrastructure Deficit': '#ffa502',
    'Balanced Growth': '#A020F0',
    'Unknown': '#666'
  };
  return colors[clusterName] || '#666';
};

function Dashboard() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [earlyMovers, setEarlyMovers] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/data/Final_DIRI_Rankings_All_Districts.json').then(r => r.json()),
      fetch('/data/Early_Mover_Districts_Final.json').then(r => r.json()),
      fetch('/data/State_Level_Summary.json').then(r => r.json())
    ]).then(([d, e, s]) => {
      setDistricts(d);
      setEarlyMovers(e);
      setStateData(s);
    });
  }, []);

  const top10 = districts.slice(0, 10);
  const top20States = stateData.slice(0, 20);
  
  const scatterData = districts.slice(0, 150).map(d => ({
    x: parseFloat(d.DIRI_ML_Scaled) || 0,
    y: (parseFloat(d.AllocatedFDIINR) / 100000) || 0,
    name: d.District
  }));

  const factorData = [
    { factor: 'Infrastructure', weight: 69.3, color: '#00d4ff' },
    { factor: 'Economic Capacity', weight: 14.2, color: '#ff4757' },
    { factor: 'Labor Quality', weight: 8.9, color: '#2ed573' },
    { factor: 'Enterprise Maturity', weight: 7.5, color: '#ffa502' }
  ];

  const clusterCounts = districts.reduce((acc, d) => {
    const cluster = d.ClusterName || 'Unknown';
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {});

  const clusterChartData = Object.keys(clusterCounts).map(key => ({
    name: key,
    value: clusterCounts[key]
  }));

  const topByFactor2 = [...districts]
    .sort((a, b) => (parseFloat(b.Factor2) || 0) - (parseFloat(a.Factor2) || 0))
    .slice(0, 10);

  const filteredEarly = earlyMovers.filter(d => 
    d.District?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.State?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#00d4ff', '#ff00a8', '#2ed573', '#ffa502', '#5f27cd'];

  return (
    <div className="dashboard">
      <div className="gradient-bg"></div>
      
      {/* Sidebar */}
      <div className="sidebar">
        <Link to="/" className="logo">← DIRI</Link>
        <nav className="sidebar-nav">
          <button onClick={() => navigate('/dashboard')} className="nav-item">📊 Overview</button>
          <button onClick={() => navigate('/dashboard/analytics')} className="nav-item">📈 Analytics</button>
          <button onClick={() => navigate('/dashboard/factors')} className="nav-item">🔬 Factors</button>
          <button onClick={() => navigate('/dashboard/clusters')} className="nav-item">🎯 Clusters</button>
          <button onClick={() => navigate('/dashboard/states')} className="nav-item">🗺️ States</button>
          <button onClick={() => navigate('/dashboard/earlymovers')} className="nav-item">🚀 Early Movers</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>DIRI Analytics Dashboard</h1>
          <div className="header-stats">
            <div className="mini-stat">
              <span className="mini-stat-number">{districts.length}</span>
              <span className="mini-stat-label">Districts</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-number">{stateData.length}</span>
              <span className="mini-stat-label">States</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-number">{earlyMovers.length}</span>
              <span className="mini-stat-label">Early Movers</span>
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <>
              <section className="section">
                <h2 className="section-title">🏆 Top 10 Districts</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={top10} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="District" angle={-45} textAnchor="end" height={120} stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                      <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
                      <Tooltip contentStyle={{background: 'rgba(26, 26, 46, 0.95)', border: '1px solid #00d4ff', borderRadius: '12px', padding: '15px'}} />
                      <Bar dataKey="DIRI_ML_Scaled" radius={[10, 10, 0, 0]}>
                        {top10.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getClusterColor(entry.ClusterName)} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="section">
                <h2 className="section-title">📊 Detailed Rankings</h2>
                <div className="table-wrapper">
                  <table className="pro-table">
                    <thead>
                      <tr><th>Rank</th><th>District</th><th>State</th><th>DIRI</th><th>FDI (₹ Cr)</th><th>Cluster</th></tr>
                    </thead>
                    <tbody>
                      {top10.map((d, idx) => (
                        <tr key={idx}>
                          <td><span className="rank-badge">#{idx + 1}</span></td>
                          <td className="district-name">{d.District}</td>
                          <td>{d.State}</td>
                          <td><span className="score-badge">{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</span></td>
                          <td>₹{(parseFloat(d.AllocatedFDIINR) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                          <td><span className="cluster-badge" style={{background: `${getClusterColor(d.ClusterName)}20`, border: `1px solid ${getClusterColor(d.ClusterName)}`, color: getClusterColor(d.ClusterName)}}>{d.ClusterName}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          } />

          <Route path="/analytics" element={
            <section className="section">
              <h2 className="section-title">📈 DIRI vs FDI</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={550}>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" dataKey="x" stroke="#fff" tick={{ fill: '#fff' }} label={{ value: 'DIRI Score', position: 'bottom', offset: 10, fill: '#fff' }} domain={[0, 100]} />
                    <YAxis type="number" dataKey="y" stroke="#fff" tick={{ fill: '#fff' }} label={{ value: 'FDI (₹ Lakh Cr)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '10px', color: '#fff'}} />
                    <Scatter data={scatterData} fill="#00d4ff" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="insights-grid">
                {factorData.map((f, idx) => (
                  <div className="insight-card" key={idx}>
                    <h3 style={{color: f.color}}>{f.factor}</h3>
                    <div className="insight-value">{f.weight}%</div>
                  </div>
                ))}
              </div>
            </section>
          } />

          <Route path="/factors" element={
            <>
              <section className="section">
                <h2 className="section-title">🔬 Factor Weights</h2>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px'}}>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie data={factorData} dataKey="weight" nameKey="factor" cx="50%" cy="50%" outerRadius={120} label={(e) => `${e.factor}: ${e.weight}%`}>
                          {factorData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '10px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={factorData} layout="vertical" margin={{ left: 150 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#fff" tick={{ fill: '#fff' }} />
                        <YAxis type="category" dataKey="factor" stroke="#fff" tick={{ fill: '#fff' }} />
                        <Tooltip contentStyle={{background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '10px'}} />
                        <Bar dataKey="weight" radius={[0, 10, 10, 0]}>
                          {factorData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
              <section className="section">
                <h2 className="section-title">🏗️ Top 10 by Infrastructure</h2>
                <div className="table-wrapper">
                  <table className="pro-table">
                    <thead><tr><th>Rank</th><th>District</th><th>State</th><th>Factor 2</th><th>DIRI</th></tr></thead>
                    <tbody>
                      {topByFactor2.map((d, idx) => (
                        <tr key={idx}>
                          <td><span className="rank-badge">#{idx + 1}</span></td>
                          <td className="district-name">{d.District}</td>
                          <td>{d.State}</td>
                          <td><span className="score-badge">{parseFloat(d.Factor2).toFixed(2)}</span></td>
                          <td>{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          } />

          <Route path="/clusters" element={
            <>
              <section className="section">
                <h2 className="section-title">🎯 Cluster Distribution</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={450}>
                    <PieChart>
                      <Pie data={clusterChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={140} label={(e) => `${e.name} (${e.value})`}>
                        {clusterChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '10px'}} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
              <section className="section">
                <div className="insights-grid">
                  {Object.keys(clusterCounts).map((cluster, idx) => (
                    <div className="insight-card" key={idx}>
                      <h3>{cluster}</h3>
                      <div className="insight-value">{clusterCounts[cluster]}</div>
                      <p>Districts</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          } />

          <Route path="/states" element={
            <section className="section">
              <h2 className="section-title">🗺️ State Performance</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={600}>
                  <BarChart data={top20States} margin={{ bottom: 120, left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="State" angle={-45} textAnchor="end" height={140} stroke="#fff" tick={{ fill: '#fff', fontSize: 11 }} />
                    <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
                    <Tooltip contentStyle={{background: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '10px'}} />
                    <Bar dataKey="DIRI_ML_Scaled" fill="#00d4ff" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          } />

          <Route path="/earlymovers" element={
            <section className="section">
              <h2 className="section-title">🚀 Early Movers</h2>
              <input type="text" className="search-box" placeholder="🔍 Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="table-wrapper">
                <table className="pro-table">
                  <thead><tr><th>Rank</th><th>District</th><th>State</th><th>DIRI</th><th>FDI</th><th>Cluster</th></tr></thead>
                  <tbody>
                    {filteredEarly.slice(0, 50).map((d, idx) => (
                      <tr key={idx}>
                        <td><span className="rank-badge">#{idx + 1}</span></td>
                        <td className="district-name">{d.District}</td>
                        <td>{d.State}</td>
                        <td><span className="score-badge">{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</span></td>
                        <td>₹{(parseFloat(d.AllocatedFDIINR) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                        <td><span className="cluster-badge" style={{background: `${getClusterColor(d.ClusterName)}20`, border: `1px solid ${getClusterColor(d.ClusterName)}`, color: getClusterColor(d.ClusterName)}}>{d.ClusterName}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;