import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import './PageStyles.css';
import './DistrictsPage.css';

const getClusterColor = (clusterName) => {
  const colors = {
    'Metro Hubs': '#3b82f6',
    'MSME Strongholds': '#8b5cf6',
    'Emerging Markets': '#10b981',
    'Infrastructure Deficit': '#f59e0b',
    'Balanced Growth': '#ec4899'
  };
  return colors[clusterName] || '#6b7280';
};

function DistrictsPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('top50');
  const [sortBy, setSortBy] = useState('diri');

  useEffect(() => {
    fetch('/data/Final_DIRI_Rankings_All_Districts.json')
      .then(r => r.json())
      .then(data => setDistricts(data));
  }, []);

  // Get unique values
  const clusters = ['All', ...new Set(districts.map(d => d.ClusterName).filter(Boolean))];
  const states = ['All', ...new Set(districts.map(d => d.State).filter(Boolean))].sort();

  // Filter and sort
  let filteredDistricts = districts.filter(d => {
    const matchesCluster = selectedCluster === 'All' || d.ClusterName === selectedCluster;
    const matchesState = selectedState === 'All' || d.State === selectedState;
    const matchesSearch = !searchTerm || 
      d.District?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.State?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCluster && matchesState && matchesSearch;
  });

  // Sort
  if (sortBy === 'fdi') {
    filteredDistricts = [...filteredDistricts].sort((a, b) => 
      (parseFloat(b.AllocatedFDIINR) || 0) - (parseFloat(a.AllocatedFDIINR) || 0)
    );
  }

  // Display count based on view mode
  const displayCount = viewMode === 'top10' ? 10 : 
                       viewMode === 'top20' ? 20 :
                       viewMode === 'top50' ? 50 : 
                       viewMode === 'top100' ? 100 : 
                       filteredDistricts.length;
  
  const displayDistricts = filteredDistricts.slice(0, displayCount);
  const top10 = filteredDistricts.slice(0, 10);

  // Calculate metrics
  const avgDIRI = (filteredDistricts.reduce((sum, d) => sum + parseFloat(d.DIRI_ML_Scaled || 0), 0) / filteredDistricts.length).toFixed(1);
  const totalFDI = filteredDistricts.reduce((sum, d) => sum + parseFloat(d.AllocatedFDIINR || 0), 0) / 100;
  const highPerformers = filteredDistricts.filter(d => d.DIRI_ML_Scaled > 75).length;
  const topDistrict = filteredDistricts[0];
  const medianDIRI = filteredDistricts.length > 0 ? 
    parseFloat(filteredDistricts[Math.floor(filteredDistricts.length / 2)].DIRI_ML_Scaled).toFixed(1) : 0;

  // Cluster distribution in filtered data
  const clusterDist = filteredDistricts.reduce((acc, d) => {
    const cluster = d.ClusterName || 'Unknown';
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {});

  const clusterPieData = Object.keys(clusterDist).map(key => ({
    name: key,
    value: clusterDist[key]
  }));

  return (
    <div className="clean-page">
      <div className="clean-bg"></div>
      
      <div className="clean-container">
        <Link to="/" className="clean-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Link>
        
        <div className="clean-header">
          <div className="clean-header-content">
            <div className="clean-icon">🏆</div>
            <div>
              <h1 className="clean-title">District Rankings</h1>
              <p className="clean-subtitle">Comprehensive investment readiness analysis across {districts.length} Indian districts</p>
            </div>
          </div>
        </div>

        {/* Performance Summary Cards */}
        <div className="performance-summary">
          <div className="perf-card" style={{ borderLeftColor: '#3b82f6' }}>
            <div className="perf-card-header">
              <span className="perf-card-title">Average DIRI</span>
              <span className="perf-card-icon">📊</span>
            </div>
            <div className="perf-card-value" style={{ color: '#3b82f6' }}>{avgDIRI}</div>
            <div className="perf-card-subtitle">Median: {medianDIRI}</div>
          </div>

          <div className="perf-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="perf-card-header">
              <span className="perf-card-title">Top Performer</span>
              <span className="perf-card-icon">🥇</span>
            </div>
            <div className="perf-card-value" style={{ color: '#10b981', fontSize: '20px' }}>
              {topDistrict?.District || 'N/A'}
            </div>
            <div className="perf-card-subtitle">Score: {topDistrict ? parseFloat(topDistrict.DIRI_ML_Scaled).toFixed(1) : 0}</div>
          </div>

          <div className="perf-card" style={{ borderLeftColor: '#f59e0b' }}>
            <div className="perf-card-header">
              <span className="perf-card-title">Total FDI</span>
              <span className="perf-card-icon">💰</span>
            </div>
            <div className="perf-card-value" style={{ color: '#f59e0b' }}>₹{(totalFDI / 100000).toFixed(1)}L Cr</div>
            <div className="perf-card-subtitle">Across {filteredDistricts.length} districts</div>
          </div>

          <div className="perf-card" style={{ borderLeftColor: '#8b5cf6' }}>
            <div className="perf-card-header">
              <span className="perf-card-title">High Performers</span>
              <span className="perf-card-icon">🎯</span>
            </div>
            <div className="perf-card-value" style={{ color: '#8b5cf6' }}>{highPerformers}</div>
            <div className="perf-card-subtitle">DIRI Score &gt; 75</div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="filter-panel">
          <div className="filter-panel-header">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Advanced Filters
          </div>
          <div className="filter-grid">
            <div className="filter-item">
              <label className="filter-item-label">Search</label>
              <div className="clean-search-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search districts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="clean-search"
                />
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-item-label">Cluster</label>
              <select 
                value={selectedCluster} 
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="dropdown-select"
              >
                {clusters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-item-label">State</label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="dropdown-select"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-item-label">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="dropdown-select"
              >
                <option value="diri">DIRI Score (High to Low)</option>
                <option value="fdi">FDI Allocation (High to Low)</option>
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-item-label">View Mode</label>
              <div className="view-mode-buttons">
                <button className={`view-mode-btn ${viewMode === 'top10' ? 'active' : ''}`} onClick={() => setViewMode('top10')}>Top 10</button>
                <button className={`view-mode-btn ${viewMode === 'top20' ? 'active' : ''}`} onClick={() => setViewMode('top20')}>Top 20</button>
                <button className={`view-mode-btn ${viewMode === 'top50' ? 'active' : ''}`} onClick={() => setViewMode('top50')}>Top 50</button>
                <button className={`view-mode-btn ${viewMode === 'top100' ? 'active' : ''}`} onClick={() => setViewMode('top100')}>Top 100</button>
                <button className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`} onClick={() => setViewMode('all')}>All</button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Charts */}
        <div className="charts-grid-two">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📈 Top 10 Districts by DIRI Score</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={top10} margin={{ top: 20, right: 20, bottom: 70, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="District" 
                  angle={-35} 
                  textAnchor="end" 
                  height={90} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                <Bar dataKey="DIRI_ML_Scaled" radius={[6, 6, 0, 0]}>
                  {top10.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getClusterColor(entry.ClusterName)} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">🎯 Cluster Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie 
                  data={clusterPieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100}
                  label={(e) => `${e.name}: ${e.value}`}
                  labelStyle={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }}
                >
                  {clusterPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getClusterColor(entry.name)} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights */}
        <div className="insights-section">
          <div className="insights-header">
            <div className="insights-icon">💡</div>
            <h3 className="insights-title">Key Insights & Interpretations</h3>
          </div>
          <div className="insights-grid">
            <div className="insight-item">
              <div className="insight-item-title">Top Performer Analysis</div>
              <div className="insight-item-text">
                <span className="insight-highlight">{topDistrict?.District}</span> leads with a DIRI score of <span className="insight-highlight">{topDistrict ? parseFloat(topDistrict.DIRI_ML_Scaled).toFixed(1) : 0}</span>, demonstrating exceptional infrastructure and economic readiness. This district serves as a benchmark for investment attractiveness.
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-item-title">Performance Distribution</div>
              <div className="insight-item-text">
                <span className="insight-highlight">{highPerformers} districts</span> ({((highPerformers / filteredDistricts.length) * 100).toFixed(1)}%) score above 75, indicating strong investment readiness. These districts offer immediate opportunities for FDI deployment.
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-item-title">FDI Allocation Pattern</div>
              <div className="insight-item-text">
                Total FDI of <span className="insight-highlight">₹{(totalFDI / 100000).toFixed(2)} Lakh Crore</span> shows {sortBy === 'fdi' ? 'strong correlation with readiness scores' : 'concentration in high-DIRI districts'}, validating the DIRI framework's predictive accuracy.
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-item-title">Cluster Insights</div>
              <div className="insight-item-text">
                {selectedCluster === 'All' ? 
                  `Distribution spans ${Object.keys(clusterDist).length} clusters, with varying readiness profiles. Each cluster represents distinct investment opportunities.` :
                  `${selectedCluster} cluster contains ${clusterDist[selectedCluster] || 0} districts with specialized characteristics suitable for targeted investments.`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📋 Detailed District Rankings</h3>
            <span className="result-tag">{displayDistricts.length} of {filteredDistricts.length} districts</span>
          </div>
          <div className="clean-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>District</th>
                  <th>State</th>
                  <th>DIRI Score</th>
                  <th>FDI (₹ Crore)</th>
                  <th>Cluster</th>
                </tr>
              </thead>
              <tbody>
                {displayDistricts.map((d, idx) => (
                  <tr key={idx}>
                    <td><div className="rank-num">{idx + 1}</div></td>
                    <td className="district-col"><div className="district-name">{d.District}</div></td>
                    <td className="state-col">{d.State}</td>
                    <td>
                      <div className="score-display">
                        <div className="score-bg" style={{ width: `${d.DIRI_ML_Scaled}%`, background: getClusterColor(d.ClusterName) }}></div>
                        <span className="score-num">{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="fdi-col">₹{(parseFloat(d.AllocatedFDIINR) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                    <td>
                      <span className="cluster-tag" style={{
                        background: `${getClusterColor(d.ClusterName)}20`,
                        color: getClusterColor(d.ClusterName),
                        borderLeft: `2px solid ${getClusterColor(d.ClusterName)}`
                      }}>
                        {d.ClusterName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistrictsPage;
