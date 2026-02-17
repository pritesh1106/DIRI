import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import './PageStyles.css';
import './EarlyMoversPage.css';

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

function EarlyMoversPage() {
  const [earlyMovers, setEarlyMovers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [diriMin, setDiriMin] = useState(65);
  const [diriMax, setDiriMax] = useState(100);
  const [fdiMax, setFdiMax] = useState(100000);
  const [viewMode, setViewMode] = useState('cards');
  const [compareDistrict1, setCompareDistrict1] = useState('');
  const [compareDistrict2, setCompareDistrict2] = useState('');

  useEffect(() => {
    fetch('/data/Early_Mover_Districts_Final.json')
      .then(r => r.json())
      .then(data => setEarlyMovers(data));
  }, []);

  // Get unique values
  const clusters = ['All', ...new Set(earlyMovers.map(d => d.ClusterName).filter(Boolean))];
  const states = ['All', ...new Set(earlyMovers.map(d => d.State).filter(Boolean))].sort();

  // Filter districts
  const filteredEarly = earlyMovers.filter(d => {
    const matchesSearch = !searchTerm || 
      d.District?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.State?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'All' || d.ClusterName === selectedCluster;
    const matchesState = selectedState === 'All' || d.State === selectedState;
    const matchesDIRI = parseFloat(d.DIRI_ML_Scaled) >= diriMin && parseFloat(d.DIRI_ML_Scaled) <= diriMax;
    const matchesFDI = parseFloat(d.AllocatedFDIINR) / 100 <= fdiMax;
    return matchesSearch && matchesCluster && matchesState && matchesDIRI && matchesFDI;
  });

  // Calculate opportunity score (DIRI high, FDI low = better opportunity)
  const districtsWithScore = filteredEarly.map(d => ({
    ...d,
    opportunityScore: (parseFloat(d.DIRI_ML_Scaled) / 100) * (1 - Math.min(parseFloat(d.AllocatedFDIINR) / 1000000, 1))
  })).sort((a, b) => b.opportunityScore - a.opportunityScore);

  const top50 = districtsWithScore.slice(0, 50);

  // Stats
  const avgDIRI = (filteredEarly.reduce((sum, d) => sum + parseFloat(d.DIRI_ML_Scaled || 0), 0) / filteredEarly.length).toFixed(1);
  const avgFDI = (filteredEarly.reduce((sum, d) => sum + parseFloat(d.AllocatedFDIINR || 0), 0) / filteredEarly.length / 100).toFixed(0);
  const highPotential = filteredEarly.filter(d => parseFloat(d.DIRI_ML_Scaled) > 75).length;

  // Scatter data
  const scatterData = top50.slice(0, 30).map(d => ({
    x: parseFloat(d.DIRI_ML_Scaled) || 0,
    y: (parseFloat(d.AllocatedFDIINR) / 100) || 0,
    name: d.District,
    score: d.opportunityScore
  }));

  // Comparison
  const district1Data = earlyMovers.find(d => d.District === compareDistrict1);
  const district2Data = earlyMovers.find(d => d.District === compareDistrict2);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCluster('All');
    setSelectedState('All');
    setDiriMin(65);
    setDiriMax(100);
    setFdiMax(100000);
  };

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
            <div className="clean-icon">🚀</div>
            <div>
              <h1 className="clean-title">Early Mover Opportunities</h1>
              <p className="clean-subtitle">High-DIRI, low-FDI saturation districts with first-mover advantage potential</p>
            </div>
          </div>
        </div>

        {/* Opportunity Alert Banner */}
        <div className="opportunity-alert-banner">
          <div className="opportunity-alert-content">
            <div className="opportunity-alert-icon">💎</div>
            <h2 className="opportunity-alert-title">Untapped Investment Goldmines</h2>
            <p className="opportunity-alert-subtitle">Strategic districts with exceptional readiness scores and minimal competition</p>
            <div className="opportunity-stats-row">
              <div className="opportunity-stat">
                <div className="opportunity-stat-value">{filteredEarly.length}</div>
                <div className="opportunity-stat-label">Opportunities</div>
              </div>
              <div className="opportunity-stat">
                <div className="opportunity-stat-value">{avgDIRI}</div>
                <div className="opportunity-stat-label">Avg DIRI</div>
              </div>
              <div className="opportunity-stat">
                <div className="opportunity-stat-value">{highPotential}</div>
                <div className="opportunity-stat-label">High Potential</div>
              </div>
              <div className="opportunity-stat">
                <div className="opportunity-stat-value">₹{avgFDI} Cr</div>
                <div className="opportunity-stat-label">Avg FDI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="advanced-filters-section">
          <div className="filters-header">
            <div className="filters-title">
              <span>🔍</span>
              <span>Advanced Opportunity Filters</span>
            </div>
            <button className="filters-reset-btn" onClick={resetFilters}>
              Reset All
            </button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search District/State</label>
              <input 
                type="text"
                className="range-input"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Cluster Type</label>
              <select 
                className="filter-select"
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
              >
                {clusters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">State</label>
              <select 
                className="filter-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Min DIRI Score</label>
              <input 
                type="number"
                className="range-input"
                value={diriMin}
                onChange={(e) => setDiriMin(parseFloat(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max DIRI Score</label>
              <input 
                type="number"
                className="range-input"
                value={diriMax}
                onChange={(e) => setDiriMax(parseFloat(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max FDI (₹ Cr)</label>
              <input 
                type="number"
                className="range-input"
                value={fdiMax}
                onChange={(e) => setFdiMax(parseFloat(e.target.value))}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Why Invest Section */}
        <div className="why-invest-section">
          <div className="why-invest-header">
            <span className="why-invest-icon">💡</span>
            <h3 className="why-invest-title">Why Early Mover Advantage Matters</h3>
          </div>
          <div className="why-invest-grid">
            <div className="why-invest-card">
              <div className="why-invest-number">1</div>
              <div className="why-invest-content">
                <h4>Lower Entry Costs</h4>
                <p>Land and operational costs are significantly lower in districts with minimal FDI saturation, offering 30-50% cost advantages compared to established hubs.</p>
              </div>
            </div>
            <div className="why-invest-card">
              <div className="why-invest-number">2</div>
              <div className="why-invest-content">
                <h4>Government Incentives</h4>
                <p>High-DIRI districts with low investment often qualify for special economic zones, tax holidays, and priority infrastructure support from state and central governments.</p>
              </div>
            </div>
            <div className="why-invest-card">
              <div className="why-invest-number">3</div>
              <div className="why-invest-content">
                <h4>Market Leadership</h4>
                <p>Establish dominant market position before competition intensifies. Early entrants capture prime locations, talent pool, and distribution networks.</p>
              </div>
            </div>
            <div className="why-invest-card">
              <div className="why-invest-number">4</div>
              <div className="why-invest-content">
                <h4>Infrastructure Growth</h4>
                <p>These districts have strong DIRI scores indicating infrastructure readiness. Investment now positions you at the epicenter of upcoming economic growth corridors.</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <span>🎴</span>
            <span>Cards View</span>
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <span>📊</span>
            <span>Table View</span>
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            <span>📈</span>
            <span>Chart View</span>
          </button>
        </div>

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="opportunity-cards-grid">
            {top50.map((d, idx) => (
              <div className="opportunity-card" key={idx}>
                <div className="opportunity-card-header">
                  <div className="opportunity-badge">🎯 TOP OPPORTUNITY</div>
                  <div className="opportunity-score">{(d.opportunityScore * 100).toFixed(0)}</div>
                </div>
                <div className="opportunity-card-district">{d.District}</div>
                <div className="opportunity-card-state">📍 {d.State}</div>
                <div className="opportunity-card-metrics">
                  <div className="opportunity-metric">
                    <div className="opportunity-metric-value">{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</div>
                    <div className="opportunity-metric-label">DIRI Score</div>
                  </div>
                  <div className="opportunity-metric">
                    <div className="opportunity-metric-value">₹{(parseFloat(d.AllocatedFDIINR) / 100).toFixed(0)}</div>
                    <div className="opportunity-metric-label">FDI (Cr)</div>
                  </div>
                </div>
                <span 
                  className="opportunity-card-cluster"
                  style={{
                    background: `${getClusterColor(d.ClusterName)}20`,
                    color: getClusterColor(d.ClusterName),
                    border: `1px solid ${getClusterColor(d.ClusterName)}`
                  }}
                >
                  {d.ClusterName}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📋 Detailed Opportunity List</h3>
              <span className="result-tag">{filteredEarly.length} opportunities</span>
            </div>
            <div className="clean-table-wrapper">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>District</th>
                    <th>State</th>
                    <th>DIRI</th>
                    <th>FDI (₹ Cr)</th>
                    <th>Opportunity Score</th>
                    <th>Cluster</th>
                  </tr>
                </thead>
                <tbody>
                  {districtsWithScore.slice(0, 100).map((d, idx) => (
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
                        <span className="score-num" style={{ color: '#10b981' }}>
                          {(d.opportunityScore * 100).toFixed(0)}
                        </span>
                      </td>
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
        )}

        {/* Chart View */}
        {viewMode === 'chart' && (
          <>
            <div className="charts-grid-two">
              <div className="clean-card">
                <div className="card-header">
                  <h3 className="card-title">🎯 Opportunity Matrix: DIRI vs FDI</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      stroke="#475569" 
                      tick={{ fill: '#94a3b8' }} 
                      label={{ value: 'DIRI Score', position: 'bottom', offset: 15, fill: '#94a3b8' }}
                      domain={[60, 100]}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      stroke="#475569" 
                      tick={{ fill: '#94a3b8' }} 
                      label={{ value: 'FDI (₹ Cr)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}}
                      labelFormatter={(v, p) => p[0]?.payload?.name || 'District'}
                    />
                    <Scatter data={scatterData} fill="#10b981">
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill="#10b981" 
                          opacity={0.6 + (entry.score * 0.4)}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="clean-card">
                <div className="card-header">
                  <h3 className="card-title">🏆 Top 10 by Opportunity Score</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={top50.slice(0, 10)} margin={{ bottom: 80, left: 20, right: 20 }}>
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
                    <Bar dataKey={(d) => d.opportunityScore * 100} name="Opportunity Score" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="clean-card">
              <div className="card-header">
                <h3 className="card-title">📊 Cluster-wise Opportunity Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={clusters.filter(c => c !== 'All').map(cluster => ({
                    cluster,
                    count: filteredEarly.filter(d => d.ClusterName === cluster).length,
                    avgScore: filteredEarly.filter(d => d.ClusterName === cluster).length > 0
                      ? (filteredEarly.filter(d => d.ClusterName === cluster).reduce((sum, d) => {
                          const score = (parseFloat(d.DIRI_ML_Scaled) / 100) * (1 - Math.min(parseFloat(d.AllocatedFDIINR) / 1000000, 1));
                          return sum + score;
                        }, 0) / filteredEarly.filter(d => d.ClusterName === cluster).length * 100)
                      : 0
                  }))}
                  layout="vertical"
                  margin={{ left: 150, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="cluster" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                  <Bar dataKey="avgScore" name="Avg Opportunity Score" radius={[0, 6, 6, 0]}>
                    {clusters.filter(c => c !== 'All').map((cluster, index) => (
                      <Cell key={`cell-${index}`} fill={getClusterColor(cluster)} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Comparison Tool */}
        <div className="comparison-tool">
          <div className="comparison-header">
            <span className="comparison-icon">⚖️</span>
            <h3 className="comparison-title">District Comparison Tool</h3>
          </div>
          <div className="comparison-selectors">
            <select 
              className="comparison-select"
              value={compareDistrict1}
              onChange={(e) => setCompareDistrict1(e.target.value)}
            >
              <option value="">Select District 1</option>
              {earlyMovers.map((d, idx) => (
                <option key={idx} value={d.District}>{d.District}, {d.State}</option>
              ))}
            </select>
            <select 
              className="comparison-select"
              value={compareDistrict2}
              onChange={(e) => setCompareDistrict2(e.target.value)}
            >
              <option value="">Select District 2</option>
              {earlyMovers.map((d, idx) => (
                <option key={idx} value={d.District}>{d.District}, {d.State}</option>
              ))}
            </select>
          </div>
          {district1Data && district2Data && (
            <div className="comparison-result">
              <div className="comparison-district-block">
                <div className="comparison-district-name">{district1Data.District}</div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">State:</span>
                  <span className="comparison-stat-value">{district1Data.State}</span>
                </div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">DIRI:</span>
                  <span className="comparison-stat-value">{parseFloat(district1Data.DIRI_ML_Scaled).toFixed(1)}</span>
                </div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">FDI:</span>
                  <span className="comparison-stat-value">₹{(parseFloat(district1Data.AllocatedFDIINR) / 100).toFixed(0)} Cr</span>
                </div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">Cluster:</span>
                  <span className="comparison-stat-value">{district1Data.ClusterName}</span>
                </div>
              </div>
              <div className="comparison-district-block">
                <div className="comparison-district-name">{district2Data.District}</div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">State:</span>
                  <span className="comparison-stat-value">{district2Data.State}</span>
                </div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">DIRI:</span>
                  <span className="comparison-stat-value">{parseFloat(district2Data.DIRI_ML_Scaled).toFixed(1)}</span>
                </div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">FDI:</span>
                  <span className="comparison-stat-value">₹{(parseFloat(district2Data.AllocatedFDIINR) / 100).toFixed(0)} Cr</span>
                </div>
                <div className="comparison-stat-row">
                  <span className="comparison-stat-label">Cluster:</span>
                  <span className="comparison-stat-value">{district2Data.ClusterName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EarlyMoversPage;
