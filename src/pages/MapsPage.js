import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area } from 'recharts';
import './PageStyles.css';
import './MapsPage.css';

const getColorForScore = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 70) return '#3b82f6';
  if (score >= 60) return '#8b5cf6';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

function MapsPage() {
  const [districts, setDistricts] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('diri');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showConnections, setShowConnections] = useState(false);
  const [mapView, setMapView] = useState('bubble');

  useEffect(() => {
    Promise.all([
      fetch('/data/Final_DIRI_Rankings_All_Districts.json').then(r => r.json()),
      fetch('/data/State_Level_Summary.json').then(r => r.json())
    ]).then(([d, s]) => {
      setDistricts(d);
      setStateData(s);
    });
  }, []);

  // EXPANDED State positions - MORE STATES!
  const statePositions = {
    'Karnataka': { cx: 400, cy: 500 },
    'Maharashtra': { cx: 380, cy: 440 },
    'Gujarat': { cx: 320, cy: 400 },
    'Tamil Nadu': { cx: 410, cy: 560 },
    'Telangana': { cx: 420, cy: 460 },
    'Delhi': { cx: 380, cy: 280 },
    'Haryana': { cx: 380, cy: 300 },
    'Uttar Pradesh': { cx: 420, cy: 320 },
    'West Bengal': { cx: 510, cy: 400 },
    'Rajasthan': { cx: 340, cy: 340 },
    'Madhya Pradesh': { cx: 400, cy: 380 },
    'Kerala': { cx: 390, cy: 580 },
    'Andhra Pradesh': { cx: 420, cy: 520 },
    'Punjab': { cx: 360, cy: 260 },
    'Odisha': { cx: 480, cy: 440 },
    'Bihar': { cx: 480, cy: 360 },
    'Assam': { cx: 580, cy: 360 },
    'Chhattisgarh': { cx: 460, cy: 420 },
    'Jharkhand': { cx: 500, cy: 380 },
    'Uttarakhand': { cx: 400, cy: 280 },
    'Goa': { cx: 360, cy: 480 },
    'Himachal Pradesh': { cx: 370, cy: 250 },
    'Jammu': { cx: 350, cy: 220 },
    'Puducherry': { cx: 420, cy: 570 },
    'Chandigarh': { cx: 370, cy: 270 },
  };

  // Economic corridors
  const corridors = [
    { from: 'Delhi', to: 'Maharashtra', color: '#3b82f6' },
    { from: 'Delhi', to: 'West Bengal', color: '#8b5cf6' },
    { from: 'Karnataka', to: 'Tamil Nadu', color: '#10b981' },
    { from: 'Maharashtra', to: 'Karnataka', color: '#f59e0b' },
    { from: 'Gujarat', to: 'Maharashtra', color: '#ec4899' },
    { from: 'Gujarat', to: 'Rajasthan', color: '#06b6d4' },
  ];

  const getStateInfo = (stateName) => {
    const state = stateData.find(s => s.State.toLowerCase().includes(stateName.toLowerCase()) || stateName.toLowerCase().includes(s.State.toLowerCase()));
    return state || null;
  };

  const getBubbleSize = (state, layer) => {
    const info = getStateInfo(state);
    if (!info) return 15;
    
    switch(layer) {
      case 'diri':
        return 20 + (parseFloat(info.DIRI_ML_Scaled || 0) / 100) * 35;
      case 'fdi':
        return 20 + Math.min((parseFloat(info.AllocatedFDIINR || 0) / 5000000) * 35, 50);
      case 'cluster':
        return 28;
      case 'heatmap':
        return 20 + (parseFloat(info.DIRI_ML_Scaled || 0) / 100) * 35;
      default:
        return 25;
    }
  };

  const getBubbleColor = (state, layer) => {
    const info = getStateInfo(state);
    if (!info) return '#6b7280';
    
    switch(layer) {
      case 'diri':
        return getColorForScore(parseFloat(info.DIRI_ML_Scaled || 0));
      case 'fdi':
        const fdi = parseFloat(info.AllocatedFDIINR || 0);
        if (fdi > 4000000) return '#10b981';
        if (fdi > 1000000) return '#3b82f6';
        if (fdi > 100000) return '#8b5cf6';
        if (fdi > 10000) return '#f59e0b';
        return '#ef4444';
      case 'cluster':
        return '#3b82f6';
      case 'heatmap':
        return getColorForScore(parseFloat(info.DIRI_ML_Scaled || 0));
      default:
        return '#3b82f6';
    }
  };

  const top10States = stateData.slice(0, 10);
  const top20States = stateData.slice(0, 20);

  // Regional stats
  const regions = {
    'North': ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir'],
    'South': ['Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Kerala'],
    'West': ['Maharashtra', 'Gujarat', 'Goa', 'Rajasthan'],
    'East': ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'],
    'Central': ['Madhya Pradesh', 'Chhattisgarh']
  };

  const regionalData = Object.keys(regions).map(region => {
    const states = stateData.filter(s => regions[region].some(r => s.State.includes(r)));
    return {
      region,
      avgDIRI: states.length > 0 ? (states.reduce((sum, s) => sum + parseFloat(s.DIRI_ML_Scaled || 0), 0) / states.length).toFixed(1) : 0,
      totalFDI: (states.reduce((sum, s) => sum + parseFloat(s.AllocatedFDIINR || 0), 0) / 100000).toFixed(2),
      states: states.length,
      maxDIRI: Math.max(...states.map(s => parseFloat(s.DIRI_ML_Scaled || 0))),
      minDIRI: Math.min(...states.map(s => parseFloat(s.DIRI_ML_Scaled || 0)))
    };
  });

  return (
    <div className="clean-page maps-page">
      <div className="clean-bg"></div>
      <div className="animated-grid"></div>
      
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
              <h1 className="clean-title">Advanced Maps Visualization</h1>
              <p className="clean-subtitle">Interactive geospatial analysis of India's investment landscape</p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="maps-control-panel">
          <div className="control-panel-header">
            <span className="control-icon">🎛️</span>
            <h3>Visualization Controls</h3>
          </div>
          
          <div className="control-section">
            <label className="control-label">Map Layer</label>
            <div className="layer-buttons">
              <button 
                className={`layer-btn ${selectedLayer === 'diri' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('diri')}
                style={{ '--btn-color': '#3b82f6' }}
              >
                <span className="layer-icon">📊</span>
                <span>DIRI Score</span>
              </button>
              <button 
                className={`layer-btn ${selectedLayer === 'fdi' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('fdi')}
                style={{ '--btn-color': '#10b981' }}
              >
                <span className="layer-icon">💰</span>
                <span>FDI Flow</span>
              </button>
              <button 
                className={`layer-btn ${selectedLayer === 'heatmap' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('heatmap')}
                style={{ '--btn-color': '#f59e0b' }}
              >
                <span className="layer-icon">🔥</span>
                <span>Heatmap</span>
              </button>
              <button 
                className={`layer-btn ${selectedLayer === 'cluster' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('cluster')}
                style={{ '--btn-color': '#8b5cf6' }}
              >
                <span className="layer-icon">🎯</span>
                <span>Clusters</span>
              </button>
            </div>
          </div>

          <div className="control-section">
            <label className="control-label">View Mode</label>
            <div className="view-mode-toggles">
              <button 
                className={`view-mode-toggle ${mapView === 'bubble' ? 'active' : ''}`}
                onClick={() => setMapView('bubble')}
              >
                🫧 Bubble Map
              </button>
              <button 
                className={`view-mode-toggle ${mapView === 'choropleth' ? 'active' : ''}`}
                onClick={() => setMapView('choropleth')}
              >
                🌈 Choropleth
              </button>
              <button 
                className={`view-mode-toggle ${mapView === 'network' ? 'active' : ''}`}
                onClick={() => setMapView('network')}
              >
                🕸️ Network
              </button>
            </div>
          </div>

          <div className="control-section">
            <label className="control-label">Overlays</label>
            <div className="toggle-switches">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">🔴 Investment Hotspots</span>
              </label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showConnections}
                  onChange={(e) => setShowConnections(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">🛤️ Economic Corridors</span>
              </label>
            </div>
          </div>
        </div>

        {/* Interactive Map Canvas */}
        <div className="interactive-map-canvas">
          <div className="map-canvas-header">
            <div className="map-canvas-title">
              <span className="map-icon">🇮🇳</span>
              <span>India Investment Map</span>
              <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '12px' }}>
                ({mapView === 'bubble' ? 'Bubble Size = Score' : mapView === 'choropleth' ? 'Color Intensity = Score' : 'Connection Strength'})
              </span>
            </div>
            <div className="map-legend-compact">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#10b981' }}></span>
                Excellent
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                High
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#8b5cf6' }}></span>
                Medium
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                Moderate
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                Developing
              </span>
            </div>
          </div>

          <div className="map-canvas-container">
            <svg viewBox="0 0 700 700" className="india-map-svg">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
                </pattern>
                <radialGradient id="glow">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                </radialGradient>
              </defs>
              <rect width="700" height="700" fill="url(#grid)" />

              {/* Economic Corridors - NETWORK VIEW */}
              {(showConnections || mapView === 'network') && corridors.map((corridor, idx) => {
                const fromPos = statePositions[corridor.from];
                const toPos = statePositions[corridor.to];
                if (!fromPos || !toPos) return null;
                
                return (
                  <line
                    key={idx}
                    x1={fromPos.cx}
                    y1={fromPos.cy}
                    x2={toPos.cx}
                    y2={toPos.cy}
                    stroke={corridor.color}
                    strokeWidth={mapView === 'network' ? '4' : '2'}
                    strokeOpacity={mapView === 'network' ? '0.6' : '0.3'}
                    strokeDasharray="10,5"
                    className="corridor-line"
                  />
                );
              })}

              {/* State Bubbles */}
              {Object.keys(statePositions).map((state, idx) => {
                const pos = statePositions[state];
                const info = getStateInfo(state);
                if (!info) return null;

                const size = mapView === 'bubble' ? getBubbleSize(state, selectedLayer) : 
                             mapView === 'choropleth' ? 35 : 
                             30;
                const color = getBubbleColor(state, selectedLayer);
                const opacity = mapView === 'choropleth' ? (parseFloat(info.DIRI_ML_Scaled) / 100) : 0.75;
                const isHovered = hoveredState === state;
                const isSelected = selectedRegion === state;

                return (
                  <g key={idx} className="state-bubble-group">
                    {/* Heatmap glow */}
                    {selectedLayer === 'heatmap' && (
                      <circle
                        cx={pos.cx}
                        cy={pos.cy}
                        r={size + 40}
                        fill="url(#glow)"
                        opacity={parseFloat(info.DIRI_ML_Scaled) / 150}
                        className="heatmap-glow"
                      />
                    )}

                    {/* Hotspot rings */}
                    {showHotspots && parseFloat(info.DIRI_ML_Scaled) > 70 && (
                      <circle
                        cx={pos.cx}
                        cy={pos.cy}
                        r={size + 12}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        opacity="0.5"
                        className="hotspot-ring"
                      />
                    )}

                    {/* Main bubble */}
                    <circle
                      cx={pos.cx}
                      cy={pos.cy}
                      r={size}
                      fill={color}
                      fillOpacity={opacity}
                      stroke={isSelected ? '#fff' : isHovered ? '#fff' : 'rgba(255,255,255,0.3)'}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      className={`state-bubble ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredState(state)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => setSelectedRegion(state)}
                      style={{ cursor: 'pointer' }}
                    />

                    {/* State label */}
                    <text
                      x={pos.cx}
                      y={pos.cy + size + 18}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="600"
                      pointerEvents="none"
                    >
                      {state.length > 12 ? state.substring(0, 10) + '..' : state}
                    </text>

                    {/* Value on hover */}
                    {(isHovered || isSelected) && (
                      <text
                        x={pos.cx}
                        y={pos.cy + 5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="12"
                        fontWeight="700"
                        pointerEvents="none"
                      >
                        {selectedLayer === 'diri' ? parseFloat(info.DIRI_ML_Scaled).toFixed(1) :
                         selectedLayer === 'fdi' ? `₹${(parseFloat(info.AllocatedFDIINR) / 100000).toFixed(1)}L` :
                         parseFloat(info.DIRI_ML_Scaled).toFixed(1)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Top 5 hotspot markers */}
              {showHotspots && top10States.slice(0, 5).map((state, idx) => {
                const stateName = Object.keys(statePositions).find(s => 
                  state.State.toLowerCase().includes(s.toLowerCase()) || 
                  s.toLowerCase().includes(state.State.toLowerCase())
                );
                if (!stateName) return null;
                const pos = statePositions[stateName];
                
                return (
                  <g key={`hotspot-${idx}`}>
                    <circle
                      cx={pos.cx}
                      cy={pos.cy - getBubbleSize(stateName, selectedLayer) - 18}
                      r="10"
                      fill="#ef4444"
                      className="hotspot-marker"
                    />
                    <text
                      x={pos.cx}
                      y={pos.cy - getBubbleSize(stateName, selectedLayer) - 13}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredState && (
              <div className="map-hover-tooltip">
                <div className="tooltip-state-name">{hoveredState}</div>
                {getStateInfo(hoveredState) && (
                  <>
                    <div className="tooltip-stat">
                      <span>DIRI Score:</span>
                      <strong>{parseFloat(getStateInfo(hoveredState).DIRI_ML_Scaled).toFixed(1)}</strong>
                    </div>
                    <div className="tooltip-stat">
                      <span>FDI:</span>
                      <strong>₹{(parseFloat(getStateInfo(hoveredState).AllocatedFDIINR) / 100000).toFixed(2)}L Cr</strong>
                    </div>
                    <div className="tooltip-stat">
                      <span>Districts:</span>
                      <strong>{getStateInfo(hoveredState).District || 'N/A'}</strong>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Regional Analysis Cards */}
        <div className="regional-analysis-grid">
          <div className="regional-analysis-header">
            <h3>📍 Regional Investment Analysis</h3>
            <p>Comparative performance across India's geographic zones</p>
          </div>
          {regionalData.map((region, idx) => (
            <div 
              className="regional-card-3d" 
              key={idx}
              style={{ '--card-color': getColorForScore(parseFloat(region.avgDIRI)) }}
            >
              <div className="regional-card-glow"></div>
              <div className="regional-card-content">
                <div className="regional-icon-large">
                  {region.region === 'North' ? '🏔️' : 
                   region.region === 'South' ? '🌴' :
                   region.region === 'East' ? '🌊' : 
                   region.region === 'Central' ? '🏛️' : '🏜️'}
                </div>
                <h4 className="regional-name">{region.region} India</h4>
                <div className="regional-stats-row">
                  <div className="regional-stat-block">
                    <div className="regional-stat-value" style={{ color: getColorForScore(parseFloat(region.avgDIRI)) }}>
                      {region.avgDIRI}
                    </div>
                    <div className="regional-stat-label">Avg DIRI</div>
                  </div>
                  <div className="regional-stat-block">
                    <div className="regional-stat-value" style={{ color: '#3b82f6' }}>
                      ₹{region.totalFDI}L
                    </div>
                    <div className="regional-stat-label">Total FDI (Cr)</div>
                  </div>
                  <div className="regional-stat-block">
                    <div className="regional-stat-value" style={{ color: '#10b981' }}>
                      {region.states}
                    </div>
                    <div className="regional-stat-label">States</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="charts-grid-two">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">🔥 Top 10 Investment Hotspots</h3>
              <span className="result-tag">DIRI Rankings</span>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10States} margin={{ bottom: 80, left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="State" 
                  angle={-35} 
                  textAnchor="end" 
                  height={90} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="DIRI_ML_Scaled" name="DIRI Score" radius={[8, 8, 0, 0]}>
                  {top10States.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForScore(parseFloat(entry.DIRI_ML_Scaled))} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">💰 FDI Distribution - Top 10</h3>
              <span className="result-tag">₹ Crores</span>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10States} margin={{ bottom: 80, left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="State" 
                  angle={-35} 
                  textAnchor="end" 
                  height={90} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}}
                  formatter={(value) => [`₹${(value / 100).toFixed(0)} Cr`, 'FDI']}
                />
                <Bar dataKey="AllocatedFDIINR" name="FDI" fill="#10b981" radius={[8, 8, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DIRI vs FDI Trend */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📈 DIRI Score vs FDI Allocation - Top 20 States</h3>
            <span className="result-tag">Comparative Analysis</span>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={top20States} margin={{ bottom: 100, left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="State" 
                angle={-45} 
                textAnchor="end" 
                height={110} 
                stroke="#475569" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
              />
              <YAxis yAxisId="left" stroke="#475569" tick={{ fill: '#94a3b8' }} label={{ value: 'DIRI Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8' }} label={{ value: 'FDI (₹L Cr)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              <Legend />
              <Area yAxisId="right" type="monotone" dataKey={(d) => parseFloat(d.AllocatedFDIINR) / 100000} fill="#10b981" fillOpacity={0.2} stroke="none" name="FDI (₹L Cr)" />
              <Line yAxisId="left" type="monotone" dataKey="DIRI_ML_Scaled" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="DIRI Score" />
              <Line yAxisId="right" type="monotone" dataKey={(d) => parseFloat(d.AllocatedFDIINR) / 100000} stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="FDI (₹L Cr)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Radar Chart */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🎯 Regional Performance Radar</h3>
            <span className="result-tag">Multi-dimensional</span>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <RadarChart data={regionalData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="region" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <PolarRadiusAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              <Legend />
              <Radar name="Avg DIRI" dataKey="avgDIRI" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="Total FDI (₹L Cr)" dataKey="totalFDI" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Map Insights */}
        <div className="map-insights-panel">
          <div className="insights-panel-header">
            <span className="insights-icon">💡</span>
            <h3>Geographic Insights & Investment Patterns</h3>
          </div>
          <div className="insights-grid-3">
            <div className="insight-card-3d">
              <div className="insight-icon-circle" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                🎯
              </div>
              <h4>FDI Concentration</h4>
              <p>Top 5 states account for <strong style={{ color: '#10b981' }}>{stateData.length > 0 ? ((top10States.slice(0,5).reduce((sum, s) => sum + parseFloat(s.AllocatedFDIINR || 0), 0) / stateData.reduce((sum, s) => sum + parseFloat(s.AllocatedFDIINR || 0), 0)) * 100).toFixed(1) : '0'}%</strong> of total FDI, indicating strong metropolitan concentration in Karnataka, Maharashtra, and Gujarat.</p>
            </div>
            <div className="insight-card-3d">
              <div className="insight-icon-circle" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                🌏
              </div>
              <h4>Regional Leadership</h4>
              <p>South India leads with an average DIRI of <strong style={{ color: '#3b82f6' }}>{regionalData.find(r => r.region === 'South')?.avgDIRI || 'N/A'}</strong>, driven by strong infrastructure and tech hubs in Bengaluru, Chennai, and Hyderabad.</p>
            </div>
            <div className="insight-card-3d">
              <div className="insight-icon-circle" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                🚀
              </div>
              <h4>Emerging Corridors</h4>
              <p>Eastern states show <strong style={{ color: '#f59e0b' }}>high growth potential</strong> with improving DIRI scores but lower FDI saturation, presenting early-mover opportunities for investors.</p>
            </div>
          </div>
        </div>

        {/* State Details Table */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📊 Complete State Performance Matrix</h3>
            <span className="result-tag">{stateData.length} States</span>
          </div>
          <div className="clean-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>State</th>
                  <th>Districts</th>
                  <th>DIRI Score</th>
                  <th>FDI (₹ Cr)</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {stateData.map((s, idx) => (
                  <tr key={idx}>
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
                      ₹{(parseFloat(s.AllocatedFDIINR || 0) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}
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

export default MapsPage;
