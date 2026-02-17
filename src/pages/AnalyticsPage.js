import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend } from 'recharts';
import './PageStyles.css';
import './AnalyticsPage.css';

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

function AnalyticsPage() {
  const [districts, setDistricts] = useState([]);
  const [stateData, setStateData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/data/Final_DIRI_Rankings_All_Districts.json').then(r => r.json()),
      fetch('/data/State_Level_Summary.json').then(r => r.json())
    ]).then(([d, s]) => {
      setDistricts(d);
      setStateData(s);
    });
  }, []);

  // Scatter data
  const scatterData = districts.slice(0, 200).map(d => ({
    x: parseFloat(d.DIRI_ML_Scaled) || 0,
    y: (parseFloat(d.AllocatedFDIINR) / 100000) || 0,
    name: d.District,
    cluster: d.ClusterName
  }));

  // Factor weights
  const factorData = [
    { name: 'Infrastructure', value: 69.3, color: '#3b82f6', icon: '🏗️' },
    { name: 'Economic Capacity', value: 14.2, color: '#8b5cf6', icon: '🏭' },
    { name: 'Labor Quality', value: 8.9, color: '#10b981', icon: '👥' },
    { name: 'Enterprise Maturity', value: 7.5, color: '#f59e0b', icon: '⚙️' }
  ];

  // Calculate insights
  const totalDistricts = districts.length;
  const avgDIRI = (districts.reduce((sum, d) => sum + parseFloat(d.DIRI_ML_Scaled || 0), 0) / totalDistricts).toFixed(1);
  const totalFDI = districts.reduce((sum, d) => sum + parseFloat(d.AllocatedFDIINR || 0), 0) / 100000;
  const highPerformers = districts.filter(d => d.DIRI_ML_Scaled > 75).length;
  const lowPerformers = districts.filter(d => d.DIRI_ML_Scaled < 50).length;
  const topQuartile = districts.filter(d => d.DIRI_ML_Scaled > 65).length;

  // Cluster distribution
  const clusterDist = districts.reduce((acc, d) => {
    const cluster = d.ClusterName || 'Unknown';
    if (!acc[cluster]) {
      acc[cluster] = { count: 0, totalDIRI: 0, totalFDI: 0 };
    }
    acc[cluster].count++;
    acc[cluster].totalDIRI += parseFloat(d.DIRI_ML_Scaled) || 0;
    acc[cluster].totalFDI += parseFloat(d.AllocatedFDIINR) || 0;
    return acc;
  }, {});

  const clusterStats = Object.keys(clusterDist).map(key => ({
    name: key,
    count: clusterDist[key].count,
    avgDIRI: (clusterDist[key].totalDIRI / clusterDist[key].count).toFixed(1),
    totalFDI: (clusterDist[key].totalFDI / 100000).toFixed(2)
  }));

  // Top 10 states
  const top10States = stateData.slice(0, 10);

  // Performance tiers
  const performanceTiers = [
    { tier: 'Exceptional (>85)', count: districts.filter(d => d.DIRI_ML_Scaled > 85).length, color: '#10b981' },
    { tier: 'High (70-85)', count: districts.filter(d => d.DIRI_ML_Scaled > 70 && d.DIRI_ML_Scaled <= 85).length, color: '#3b82f6' },
    { tier: 'Medium (50-70)', count: districts.filter(d => d.DIRI_ML_Scaled > 50 && d.DIRI_ML_Scaled <= 70).length, color: '#f59e0b' },
    { tier: 'Low (<50)', count: districts.filter(d => d.DIRI_ML_Scaled <= 50).length, color: '#ef4444' }
  ];

  // FDI concentration
  const top10DIRIDistricts = districts.slice(0, 10);
  const top10FDI = top10DIRIDistricts.reduce((sum, d) => sum + parseFloat(d.AllocatedFDIINR || 0), 0);
  const fdiConcentration = ((top10FDI / (totalFDI * 100000)) * 100).toFixed(1);

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
            <div className="clean-icon">📈</div>
            <div>
              <h1 className="clean-title">Analytics Hub</h1>
              <p className="clean-subtitle">Comprehensive correlation analysis and data-driven insights</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="analytics-grid-three">
          <div className="insight-card" style={{ borderLeftColor: '#3b82f6' }}>
            <div className="insight-header">
              <div className="insight-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>📊</div>
              <div className="insight-title">Average DIRI</div>
            </div>
            <div className="insight-value" style={{ color: '#3b82f6' }}>{avgDIRI}</div>
            <div className="insight-description">Across {totalDistricts} districts analyzed</div>
          </div>

          <div className="insight-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="insight-header">
              <div className="insight-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>🎯</div>
              <div className="insight-title">High Performers</div>
            </div>
            <div className="insight-value" style={{ color: '#10b981' }}>{highPerformers}</div>
            <div className="insight-description">Districts with DIRI score above 75</div>
          </div>

          <div className="insight-card" style={{ borderLeftColor: '#f59e0b' }}>
            <div className="insight-header">
              <div className="insight-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>💰</div>
              <div className="insight-title">Total FDI</div>
            </div>
            <div className="insight-value" style={{ color: '#f59e0b' }}>₹{totalFDI.toFixed(1)}L Cr</div>
            <div className="insight-description">Cumulative FDI allocation</div>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🔍 DIRI Score vs FDI Allocation Correlation</h3>
            <span className="result-tag">Top 200 districts</span>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                type="number" 
                dataKey="x" 
                stroke="#475569" 
                tick={{ fill: '#94a3b8' }} 
                label={{ value: 'DIRI Score', position: 'bottom', offset: 15, fill: '#94a3b8' }} 
                domain={[0, 100]} 
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                stroke="#475569" 
                tick={{ fill: '#94a3b8' }} 
                label={{ value: 'FDI (₹ Lakh Cr)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{
                  background: '#0f172a', 
                  border: '1px solid #1e293b', 
                  borderRadius: '8px', 
                  color: '#e2e8f0'
                }} 
                labelFormatter={(v, p) => p[0]?.payload?.name || 'District'}
                formatter={(value, name) => [name === 'x' ? `${value.toFixed(1)}` : `₹${value.toFixed(2)} L Cr`, name === 'x' ? 'DIRI' : 'FDI']}
              />
              <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          
          <div className="correlation-stats">
            <div className="correlation-item">
              <div className="correlation-label">Model R²</div>
              <div className="correlation-value">0.82</div>
            </div>
            <div className="correlation-item">
              <div className="correlation-label">Top 10 FDI Share</div>
              <div className="correlation-value">{fdiConcentration}%</div>
            </div>
            <div className="correlation-item">
              <div className="correlation-label">Investable (>65)</div>
              <div className="correlation-value">{topQuartile}</div>
            </div>
            <div className="correlation-item">
              <div className="correlation-label">Underperformers</div>
              <div className="correlation-value">{lowPerformers}</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="charts-grid-two">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">🎯 Cluster Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={clusterStats} margin={{ bottom: 80, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-35} 
                  textAnchor="end" 
                  height={90} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} 
                />
                <Bar dataKey="avgDIRI" name="Avg DIRI" radius={[6, 6, 0, 0]}>
                  {clusterStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getClusterColor(entry.name)} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📊 Performance Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={performanceTiers} layout="vertical" margin={{ left: 120, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="tier" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {performanceTiers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Factor Weights */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">⚖️ ML Factor Weights (Ridge Regression)</h3>
            <span className="result-tag">α = 1.53</span>
          </div>
          <div className="factor-grid">
            {factorData.map((f, idx) => (
              <div className="factor-card" key={idx}>
                <div className="factor-icon" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <div className="factor-content">
                  <div className="factor-name">{f.name}</div>
                  <div className="factor-value" style={{ color: f.color }}>{f.value}%</div>
                  <div className="factor-bar">
                    <div className="factor-bar-fill" style={{ width: `${f.value}%`, background: f.color }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top States */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🗺️ Top 10 States by Average DIRI</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
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
              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              <Bar dataKey="DIRI_ML_Scaled" name="Avg DIRI" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* KEY INSIGHTS & CONCLUSIONS */}
        <div className="conclusion-section">
          <div className="conclusion-header">
            <div className="conclusion-icon">💡</div>
            <h2 className="conclusion-title">Key Insights & Conclusions</h2>
          </div>
          
          <div className="conclusion-grid">
            <div className="conclusion-card">
              <div className="conclusion-card-header">
                <div className="conclusion-number">1</div>
                <h3 className="conclusion-card-title">Strong Correlation Validated</h3>
              </div>
              <p className="conclusion-text">
                The Ridge Regression model achieves <span className="conclusion-highlight">R² = 0.82</span>, confirming strong predictive power between DIRI scores and FDI allocation. Districts with higher infrastructure readiness consistently attract more foreign investment.
              </p>
              <div className="recommendation-badge">✓ Model Reliable</div>
            </div>

            <div className="conclusion-card">
              <div className="conclusion-card-header">
                <div className="conclusion-number">2</div>
                <h3 className="conclusion-card-title">Infrastructure Dominates</h3>
              </div>
              <p className="conclusion-text">
                Infrastructure accounts for <span className="conclusion-highlight">69.3%</span> of factor weight, making it the primary FDI driver. Districts must prioritize transportation, connectivity, and industrial infrastructure development.
              </p>
              <div className="recommendation-badge">⚠️ Critical Factor</div>
            </div>

            <div className="conclusion-card">
              <div className="conclusion-card-header">
                <div className="conclusion-number">3</div>
                <h3 className="conclusion-card-title">FDI Concentration Risk</h3>
              </div>
              <p className="conclusion-text">
                Top 10 districts capture <span className="conclusion-highlight">{fdiConcentration}%</span> of total FDI, indicating high concentration. Policy interventions should target mid-tier districts (DIRI 50-70) to balance regional development.
              </p>
              <div className="recommendation-badge">📊 Policy Insight</div>
            </div>

            <div className="conclusion-card">
              <div className="conclusion-card-header">
                <div className="conclusion-number">4</div>
                <h3 className="conclusion-card-title">Metro Hubs Lead Performance</h3>
              </div>
              <p className="conclusion-text">
                Metro Hubs cluster shows highest average DIRI scores, driven by established infrastructure and skilled labor. These districts serve as investment benchmarks for emerging markets.
              </p>
              <div className="recommendation-badge">🎯 Best Practice</div>
            </div>

            <div className="conclusion-card">
              <div className="conclusion-card-header">
                <div className="conclusion-number">5</div>
                <h3 className="conclusion-card-title">Untapped Potential</h3>
              </div>
              <p className="conclusion-text">
                <span className="conclusion-highlight">{topQuartile} districts</span> with DIRI &gt;65 remain investment-ready. Early mover advantage exists in Emerging Markets and MSME Strongholds clusters with lower competition.
              </p>
              <div className="recommendation-badge">🚀 Opportunity</div>
            </div>

            <div className="conclusion-card">
              <div className="conclusion-card-header">
                <div className="conclusion-number">6</div>
                <h3 className="conclusion-card-title">Regional Disparity</h3>
              </div>
              <p className="conclusion-text">
                <span className="conclusion-highlight">{lowPerformers} districts</span> score below 50, signaling infrastructure deficits. Targeted central schemes and state partnerships are critical for inclusive growth.
              </p>
              <div className="recommendation-badge">🔴 Action Required</div>
            </div>
          </div>
        </div>

        {/* Cluster Stats Table */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📋 Detailed Cluster Statistics</h3>
          </div>
          <div className="clean-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Cluster</th>
                  <th>Districts</th>
                  <th>Avg DIRI</th>
                  <th>Total FDI (₹ Lakh Cr)</th>
                  <th>Avg FDI per District</th>
                </tr>
              </thead>
              <tbody>
                {clusterStats.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="cluster-tag" style={{
                        background: `${getClusterColor(c.name)}20`,
                        color: getClusterColor(c.name),
                        borderLeft: `2px solid ${getClusterColor(c.name)}`
                      }}>
                        {c.name}
                      </span>
                    </td>
                    <td className="district-name">{c.count}</td>
                    <td><span className="score-num">{c.avgDIRI}</span></td>
                    <td className="fdi-col">₹{parseFloat(c.totalFDI).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                    <td className="fdi-col">₹{(parseFloat(c.totalFDI) / c.count).toFixed(2)}</td>
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

export default AnalyticsPage;
