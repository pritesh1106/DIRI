import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import './PageStyles.css';
import './StatesPage.css';

// Color scale based on DIRI score
const getColorForScore = (score) => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 70) return '#3b82f6'; // Blue
  if (score >= 60) return '#8b5cf6'; // Purple
  if (score >= 50) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
};

function StatesPage() {
  const [stateData, setStateData] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch('/data/State_Level_Summary.json')
      .then(r => r.json())
      .then(data => {
        setStateData(data);
        if (data.length > 0) setSelectedState(data[0].State);
      });
  }, []);

  // Get state by name
  const getStateData = (stateName) => {
    return stateData.find(s => s.State.toLowerCase().includes(stateName.toLowerCase()));
  };

  // Handle state click
  const handleStateClick = (stateName) => {
    const state = getStateData(stateName);
    if (state) {
      setSelectedState(state.State);
    }
  };

  // Handle hover
  const handleStateHover = (e, stateName) => {
    const state = getStateData(stateName);
    if (state) {
      const rect = e.target.getBoundingClientRect();
      setTooltipData(state);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleStateLeave = () => {
    setTooltipData(null);
  };

  // Top 3 states
  const top3 = stateData.slice(0, 3);
  const top20 = stateData.slice(0, 20);

  // Selected state details
  const selectedStateData = stateData.find(s => s.State === selectedState);

  // Regional analysis (simplified)
  const regions = {
    'North': ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir'],
    'South': ['Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Kerala'],
    'West': ['Maharashtra', 'Gujarat', 'Goa', 'Rajasthan'],
    'East': ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand'],
    'Central': ['Madhya Pradesh', 'Chhattisgarh']
  };

  const regionalStats = Object.keys(regions).map(region => {
    const states = stateData.filter(s => regions[region].some(r => s.State.includes(r)));
    const avgDIRI = states.length > 0 
      ? (states.reduce((sum, s) => sum + parseFloat(s.DIRI_ML_Scaled || 0), 0) / states.length).toFixed(1)
      : 0;
    const totalFDI = states.reduce((sum, s) => sum + parseFloat(s.AllocatedFDIINR || 0), 0);
    return {
      region,
      avgDIRI,
      totalFDI: (totalFDI / 100000).toFixed(2),
      states: states.length
    };
  });

  // Simplified India Map (SVG paths - using simplified coordinates)
  const SimplifiedIndiaMap = () => {
    // State name mapping and approximate positions
    const statePositions = {
      'Karnataka': { name: 'Karnataka', cx: 340, cy: 420 },
      'Maharashtra': { name: 'Maharashtra', cx: 320, cy: 360 },
      'Gujarat': { name: 'Gujarat', cx: 260, cy: 320 },
      'Tamil Nadu': { name: 'Tamil Nadu', cx: 350, cy: 480 },
      'Telangana': { name: 'Telangana', cx: 360, cy: 380 },
      'Delhi': { name: 'Delhi', cx: 320, cy: 200 },
      'Haryana': { name: 'Haryana', cx: 320, cy: 220 },
      'Uttar Pradesh': { name: 'Uttar Pradesh', cx: 360, cy: 240 },
      'West Bengal': { name: 'West Bengal', cx: 450, cy: 320 },
      'Rajasthan': { name: 'Rajasthan', cx: 280, cy: 260 },
      'Madhya Pradesh': { name: 'Madhya Pradesh', cx: 340, cy: 300 },
      'Kerala': { name: 'Kerala', cx: 330, cy: 480 },
      'Andhra Pradesh': { name: 'Andhra Pradesh', cx: 360, cy: 420 },
      'Punjab': { name: 'Punjab', cx: 300, cy: 180 },
      'Odisha': { name: 'Odisha', cx: 420, cy: 360 },
    };

    return (
      <svg viewBox="0 0 600 600" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Simplified state representations as circles */}
        {Object.keys(statePositions).map(key => {
          const pos = statePositions[key];
          const state = getStateData(pos.name);
          const score = state ? parseFloat(state.DIRI_ML_Scaled || 0) : 0;
          const radius = state ? 20 + (score / 100) * 25 : 20;
          const color = getColorForScore(score);
          const isSelected = selectedState && selectedState.includes(pos.name);

          return (
            <g key={key}>
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={radius}
                fill={color}
                fillOpacity={0.7}
                className={`state-path ${isSelected ? 'selected' : ''}`}
                onClick={() => handleStateClick(pos.name)}
                onMouseEnter={(e) => handleStateHover(e, pos.name)}
                onMouseLeave={handleStateLeave}
                style={{ color: color }}
              />
              <text
                x={pos.cx}
                y={pos.cy + radius + 14}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
                pointerEvents="none"
              >
                {pos.name.length > 12 ? pos.name.substring(0, 10) + '...' : pos.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
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
            <div className="clean-icon">🗺️</div>
            <div>
              <h1 className="clean-title">State Performance Analysis</h1>
              <p className="clean-subtitle">Interactive state-level DIRI aggregation and FDI distribution across India</p>
            </div>
          </div>
        </div>

        {/* Top 3 Performers Showcase */}
        <div className="top-performers-showcase">
          {top3.map((state, idx) => (
            <div className="performer-card" key={idx}>
              <div className="performer-rank">RANK #{idx + 1}</div>
              <div className="performer-medal">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </div>
              <div className="performer-name">{state.State}</div>
              <div className="performer-score" style={{ color: getColorForScore(parseFloat(state.DIRI_ML_Scaled)) }}>
                {parseFloat(state.DIRI_ML_Scaled || 0).toFixed(1)}
              </div>
              <div className="performer-score-label">DIRI Score</div>
            </div>
          ))}
        </div>

        {/* Interactive India Map */}
        <div className="map-container">
          <div className="map-header">
            <h2 className="map-title">🇮🇳 Interactive India DIRI Map</h2>
            <p className="map-subtitle">Click on states to view detailed analytics • Bubble size = DIRI Score</p>
          </div>
          <div className="india-map-wrapper">
            <div className="india-map-svg">
              <SimplifiedIndiaMap />
            </div>
            <div className="map-legend">
              <div className="map-legend-title">DIRI Score Range</div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#10b981' }}></div>
                <div className="legend-label">Excellent</div>
                <div className="legend-range">80-100</div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#3b82f6' }}></div>
                <div className="legend-label">High</div>
                <div className="legend-range">70-80</div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
                <div className="legend-label">Medium</div>
                <div className="legend-range">60-70</div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#f59e0b' }}></div>
                <div className="legend-label">Moderate</div>
                <div className="legend-range">50-60</div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#ef4444' }}></div>
                <div className="legend-label">Developing</div>
                <div className="legend-range">&lt; 50</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltipData && (
          <div className="map-tooltip" style={{ left: tooltipPos.x + 20, top: tooltipPos.y - 80 }}>
            <div className="map-tooltip-state">{tooltipData.State}</div>
            <div className="map-tooltip-stat">
              <span className="map-tooltip-label">DIRI Score:</span>
              <span className="map-tooltip-value">{parseFloat(tooltipData.DIRI_ML_Scaled || 0).toFixed(1)}</span>
            </div>
            <div className="map-tooltip-stat">
              <span className="map-tooltip-label">FDI:</span>
              <span className="map-tooltip-value">₹{(parseFloat(tooltipData.AllocatedFDIINR || 0) / 100000).toFixed(2)}L Cr</span>
            </div>
          </div>
        )}

        {/* Selected State Details */}
        {selectedStateData && (
          <div className="state-info-panel">
            <div className="state-info-header">
              <div className="state-info-icon">🏛️</div>
              <div className="state-info-content">
                <h2>{selectedStateData.State}</h2>
                <div className="state-info-meta">
                  <span>Rank: <strong>#{stateData.findIndex(s => s.State === selectedState) + 1}</strong></span>
                  <span>•</span>
                  <span>Districts: <strong>{selectedStateData.District || 'N/A'}</strong></span>
                </div>
              </div>
            </div>
            <div className="state-stats-grid">
              <div className="state-stat-card">
                <div className="state-stat-value" style={{ color: getColorForScore(parseFloat(selectedStateData.DIRI_ML_Scaled)) }}>
                  {parseFloat(selectedStateData.DIRI_ML_Scaled || 0).toFixed(1)}
                </div>
                <div className="state-stat-label">DIRI Score</div>
              </div>
              <div className="state-stat-card">
                <div className="state-stat-value" style={{ color: '#3b82f6' }}>
                  ₹{(parseFloat(selectedStateData.AllocatedFDIINR || 0) / 100000).toFixed(2)}L Cr
                </div>
                <div className="state-stat-label">Total FDI</div>
              </div>
              <div className="state-stat-card">
                <div className="state-stat-value" style={{ color: '#10b981' }}>
                  {selectedStateData.District || 'N/A'}
                </div>
                <div className="state-stat-label">Districts</div>
              </div>
            </div>
          </div>
        )}

        {/* State Selector */}
        <div className="state-selector-section">
          <div className="state-selector-header">Select State to View Details</div>
          <div className="state-selector-grid">
            {stateData.slice(0, 20).map((state, idx) => (
              <button
                key={idx}
                className={`state-selector-button ${selectedState === state.State ? 'active' : ''}`}
                onClick={() => setSelectedState(state.State)}
              >
                {state.State}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Analysis */}
        <div className="regional-analysis">
          <div className="regional-header">
            <span className="regional-icon">🌏</span>
            <h3 className="regional-title">Regional Performance Analysis</h3>
          </div>
          <div className="regional-grid">
            {regionalStats.map((region, idx) => (
              <div className="regional-card" key={idx} style={{ borderLeftColor: getColorForScore(parseFloat(region.avgDIRI)) }}>
                <div className="regional-card-name">{region.region} India</div>
                <div className="regional-card-stat" style={{ color: getColorForScore(parseFloat(region.avgDIRI)) }}>
                  {region.avgDIRI}
                </div>
                <div className="regional-card-label">Avg DIRI • {region.states} States</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid-two">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📊 Top 20 States - DIRI Scores</h3>
            </div>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={top20} margin={{ bottom: 100, left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="State" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                <Bar dataKey="DIRI_ML_Scaled" radius={[6, 6, 0, 0]}>
                  {top20.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForScore(parseFloat(entry.DIRI_ML_Scaled))} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">💰 Top 10 States - FDI Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie 
                  data={stateData.slice(0, 10)} 
                  dataKey={(entry) => parseFloat(entry.AllocatedFDIINR || 0) / 100000}
                  nameKey="State"
                  cx="50%" 
                  cy="50%" 
                  outerRadius={120}
                  label={(entry) => `${entry.State}: ₹${(parseFloat(entry.AllocatedFDIINR || 0) / 100000).toFixed(1)}L`}
                  labelStyle={{ fill: '#e2e8f0', fontSize: 10, fontWeight: 600 }}
                >
                  {stateData.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForScore(parseFloat(entry.DIRI_ML_Scaled))} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} 
                  formatter={(value) => [`₹${value.toFixed(2)}L Cr`, 'FDI']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📈 DIRI vs FDI Trend - Top 15 States</h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stateData.slice(0, 15)} margin={{ bottom: 100, left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="State" 
                angle={-45} 
                textAnchor="end" 
                height={120} 
                stroke="#475569" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
              />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              <Legend />
              <Line type="monotone" dataKey="DIRI_ML_Scaled" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="DIRI Score" />
              <Line 
                type="monotone" 
                dataKey={(entry) => (parseFloat(entry.AllocatedFDIINR || 0) / 1000000)} 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ fill: '#10b981', r: 5 }} 
                name="FDI (₹ Lakh Cr)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📋 Complete State Rankings</h3>
            <span className="result-tag">{stateData.length} states</span>
          </div>
          <div className="clean-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>State</th>
                  <th>Districts</th>
                  <th>DIRI Score</th>
                  <th>FDI (₹ Crore)</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {stateData.map((s, idx) => (
                  <tr key={idx} onClick={() => setSelectedState(s.State)} style={{ cursor: 'pointer' }}>
                    <td><div className="rank-num">{idx + 1}</div></td>
                    <td className="district-col"><div className="district-name">{s.State}</div></td>
                    <td className="state-col">{s.District || 'N/A'}</td>
                    <td>
                      <div className="score-display">
                        <div className="score-bg" style={{ 
                          width: `${s.DIRI_ML_Scaled}%`, 
                          background: getColorForScore(parseFloat(s.DIRI_ML_Scaled)) 
                        }}></div>
                        <span className="score-num">{parseFloat(s.DIRI_ML_Scaled || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="fdi-col">
                      ₹{s.AllocatedFDIINR ? (parseFloat(s.AllocatedFDIINR) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0}) : '0'}
                    </td>
                    <td>
                      <span className="cluster-tag" style={{
                        background: `${getColorForScore(parseFloat(s.DIRI_ML_Scaled))}20`,
                        color: getColorForScore(parseFloat(s.DIRI_ML_Scaled)),
                        borderLeft: `2px solid ${getColorForScore(parseFloat(s.DIRI_ML_Scaled))}`
                      }}>
                        {parseFloat(s.DIRI_ML_Scaled) >= 80 ? 'Excellent' :
                         parseFloat(s.DIRI_ML_Scaled) >= 70 ? 'High' :
                         parseFloat(s.DIRI_ML_Scaled) >= 60 ? 'Medium' :
                         parseFloat(s.DIRI_ML_Scaled) >= 50 ? 'Moderate' : 'Developing'}
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

export default StatesPage;
