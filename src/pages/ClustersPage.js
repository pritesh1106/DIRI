import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import './PageStyles.css';
import './ClustersPage.css';

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

function ClustersPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('Metro Hubs');

  useEffect(() => {
    fetch('/data/Final_DIRI_Rankings_All_Districts.json')
      .then(r => r.json())
      .then(data => setDistricts(data));
  }, []);

  // Cluster information
  const clusterInfo = {
    'Metro Hubs': {
      icon: '🏙️',
      tagline: 'Economic Powerhouses',
      description: 'Major metropolitan centers with world-class infrastructure, skilled workforce, and established industrial ecosystems. These districts lead in FDI attraction and serve as India\'s primary investment destinations.',
      characteristics: [
        { icon: '🏗️', title: 'Superior Infrastructure', desc: 'World-class transport, power, and connectivity' },
        { icon: '💼', title: 'Skilled Workforce', desc: 'High literacy, technical expertise, and talent pool' },
        { icon: '🏢', title: 'Corporate Presence', desc: 'MNC headquarters and business centers' },
        { icon: '🌐', title: 'Global Connectivity', desc: 'International airports and trade links' }
      ],
      recommendations: [
        'Ideal for high-tech manufacturing and services sector',
        'Focus on advanced infrastructure projects and smart city initiatives',
        'Leverage existing ecosystem for supply chain development',
        'Target sectors: IT, Pharma, Automotive, Finance'
      ]
    },
    'MSME Strongholds': {
      icon: '⚙️',
      tagline: 'Industrial Backbone',
      description: 'Districts with robust MSME ecosystems, strong manufacturing base, and entrepreneurial culture. These regions offer specialized industrial clusters and cost-effective operations.',
      characteristics: [
        { icon: '🏭', title: 'Manufacturing Hub', desc: 'Dense MSME clusters and production units' },
        { icon: '🔧', title: 'Technical Expertise', desc: 'Specialized skills in niche manufacturing' },
        { icon: '🤝', title: 'Business Networks', desc: 'Strong supplier and vendor ecosystems' },
        { icon: '💡', title: 'Innovation Culture', desc: 'Entrepreneurial mindset and adaptability' }
      ],
      recommendations: [
        'Perfect for component manufacturing and ancillary industries',
        'Invest in technology upgradation and automation',
        'Develop industry-specific training centers',
        'Target sectors: Auto Components, Textiles, Engineering'
      ]
    },
    'Emerging Markets': {
      icon: '🚀',
      tagline: 'Growth Frontiers',
      description: 'Fast-growing districts with improving infrastructure and rising economic potential. These markets offer first-mover advantages and government incentives for early investors.',
      characteristics: [
        { icon: '📈', title: 'High Growth Rate', desc: 'Rapid economic expansion and development' },
        { icon: '🎯', title: 'Investment Incentives', desc: 'Government schemes and tax benefits' },
        { icon: '👥', title: 'Young Workforce', desc: 'Demographic dividend and trainable talent' },
        { icon: '🏞️', title: 'Land Availability', desc: 'Abundant space for industrial development' }
      ],
      recommendations: [
        'Early mover advantage with lower competition',
        'Capitalize on government incentive schemes',
        'Invest in workforce training and skill development',
        'Target sectors: Food Processing, Logistics, Light Manufacturing'
      ]
    },
    'Infrastructure Deficit': {
      icon: '🔨',
      tagline: 'Development Priority Zones',
      description: 'Districts requiring substantial infrastructure development but with untapped potential. Long-term investments here can yield significant returns as connectivity improves.',
      characteristics: [
        { icon: '⚠️', title: 'Infrastructure Gap', desc: 'Limited connectivity and basic amenities' },
        { icon: '🌾', title: 'Resource Rich', desc: 'Natural resources and raw materials' },
        { icon: '💰', title: 'Cost Advantage', desc: 'Low operational costs and land prices' },
        { icon: '🎁', title: 'Policy Support', desc: 'Special economic zones and incentives' }
      ],
      recommendations: [
        'Long-term investment horizon with infrastructure bets',
        'Focus on resource-based industries',
        'Partner with government for infrastructure development',
        'Target sectors: Mining, Agro-processing, Renewable Energy'
      ]
    },
    'Balanced Growth': {
      icon: '⚖️',
      tagline: 'Stable All-Rounders',
      description: 'Well-balanced districts with moderate scores across all factors. These regions offer stable investment environments with diversified economic bases and consistent growth.',
      characteristics: [
        { icon: '📊', title: 'Diversified Economy', desc: 'Multiple sectors contributing to growth' },
        { icon: '🏘️', title: 'Moderate Infrastructure', desc: 'Adequate facilities for most industries' },
        { icon: '👔', title: 'Stable Business', desc: 'Predictable growth and low volatility' },
        { icon: '🌱', title: 'Sustainable Growth', desc: 'Consistent development trajectory' }
      ],
      recommendations: [
        'Suitable for diversified portfolio investments',
        'Focus on sectors aligned with local strengths',
        'Leverage balanced ecosystem for risk mitigation',
        'Target sectors: Consumer Goods, Healthcare, Education'
      ]
    }
  };

  // Calculate cluster statistics
  const clusterStats = districts.reduce((acc, d) => {
    const cluster = d.ClusterName || 'Unknown';
    if (!acc[cluster]) {
      acc[cluster] = {
        count: 0,
        totalDIRI: 0,
        totalFDI: 0,
        avgFactor1: 0,
        avgFactor2: 0,
        avgFactor3: 0,
        avgFactor4: 0,
        districts: []
      };
    }
    acc[cluster].count++;
    acc[cluster].totalDIRI += parseFloat(d.DIRI_ML_Scaled) || 0;
    acc[cluster].totalFDI += parseFloat(d.AllocatedFDIINR) || 0;
    acc[cluster].avgFactor1 += parseFloat(d.Factor1) || 0;
    acc[cluster].avgFactor2 += parseFloat(d.Factor2) || 0;
    acc[cluster].avgFactor3 += parseFloat(d.Factor3) || 0;
    acc[cluster].avgFactor4 += parseFloat(d.Factor4) || 0;
    acc[cluster].districts.push(d);
    return acc;
  }, {});

  // Calculate averages
  Object.keys(clusterStats).forEach(key => {
    const count = clusterStats[key].count;
    clusterStats[key].avgDIRI = (clusterStats[key].totalDIRI / count).toFixed(1);
    clusterStats[key].avgFDI = (clusterStats[key].totalFDI / count / 100).toFixed(0);
    clusterStats[key].avgFactor1 = (clusterStats[key].avgFactor1 / count).toFixed(2);
    clusterStats[key].avgFactor2 = (clusterStats[key].avgFactor2 / count).toFixed(2);
    clusterStats[key].avgFactor3 = (clusterStats[key].avgFactor3 / count).toFixed(2);
    clusterStats[key].avgFactor4 = (clusterStats[key].avgFactor4 / count).toFixed(2);
  });

  // Pie chart data
  const pieData = Object.keys(clusterStats).map(key => ({
    name: key,
    value: clusterStats[key].count
  }));

  // Bar chart data for DIRI comparison
  const barData = Object.keys(clusterStats).map(key => ({
    name: key,
    avgDIRI: parseFloat(clusterStats[key].avgDIRI),
    count: clusterStats[key].count
  }));

  // Radar chart data for selected cluster
  const radarData = [
    { factor: 'Infrastructure', value: parseFloat(clusterStats[selectedCluster]?.avgFactor1 || 0) },
    { factor: 'Economic', value: parseFloat(clusterStats[selectedCluster]?.avgFactor2 || 0) },
    { factor: 'Labor', value: parseFloat(clusterStats[selectedCluster]?.avgFactor3 || 0) },
    { factor: 'Enterprise', value: parseFloat(clusterStats[selectedCluster]?.avgFactor4 || 0) }
  ];

  // Top 10 districts in selected cluster
  const top10InCluster = clusterStats[selectedCluster]?.districts
    .sort((a, b) => parseFloat(b.DIRI_ML_Scaled) - parseFloat(a.DIRI_ML_Scaled))
    .slice(0, 10) || [];

  const currentCluster = clusterInfo[selectedCluster] || clusterInfo['Metro Hubs'];
  const currentStats = clusterStats[selectedCluster] || {};

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
            <div className="clean-icon">🎯</div>
            <div>
              <h1 className="clean-title">Cluster Insights</h1>
              <p className="clean-subtitle">K-Means Clustering Analysis (k=5) - Strategic investment segments</p>
            </div>
          </div>
        </div>

        {/* Cluster Selector */}
        <div className="cluster-selector-grid">
          {Object.keys(clusterInfo).map(cluster => (
            <button
              key={cluster}
              className={`cluster-card-button ${selectedCluster === cluster ? 'active' : ''}`}
              onClick={() => setSelectedCluster(cluster)}
              style={{ color: getClusterColor(cluster) }}
            >
              <span className="cluster-card-icon">{clusterInfo[cluster].icon}</span>
              <div className="cluster-card-name">{cluster}</div>
              <div className="cluster-card-count" style={{ color: getClusterColor(cluster) }}>
                {clusterStats[cluster]?.count || 0}
              </div>
              <div className="cluster-card-label">Districts</div>
            </button>
          ))}
        </div>

        {/* Cluster Details Panel */}
        <div className="cluster-details-panel" style={{ borderColor: getClusterColor(selectedCluster) }}>
          <div className="cluster-details-header">
            <div className="cluster-details-icon-large" style={{
              background: `${getClusterColor(selectedCluster)}15`,
              color: getClusterColor(selectedCluster)
            }}>
              {currentCluster.icon}
            </div>
            <div className="cluster-details-content">
              <h2 className="cluster-details-name">{selectedCluster}</h2>
              <p className="cluster-details-tagline">{currentCluster.tagline}</p>
              <p className="cluster-details-description">{currentCluster.description}</p>
            </div>
          </div>

          <div className="cluster-stats-grid">
            <div className="cluster-stat-box">
              <div className="cluster-stat-value" style={{ color: getClusterColor(selectedCluster) }}>
                {currentStats.count || 0}
              </div>
              <div className="cluster-stat-label">Total Districts</div>
            </div>
            <div className="cluster-stat-box">
              <div className="cluster-stat-value" style={{ color: getClusterColor(selectedCluster) }}>
                {currentStats.avgDIRI || 0}
              </div>
              <div className="cluster-stat-label">Avg DIRI Score</div>
            </div>
            <div className="cluster-stat-box">
              <div className="cluster-stat-value" style={{ color: getClusterColor(selectedCluster) }}>
                ₹{currentStats.avgFDI || 0} Cr
              </div>
              <div className="cluster-stat-label">Avg FDI/District</div>
            </div>
            <div className="cluster-stat-box">
              <div className="cluster-stat-value" style={{ color: getClusterColor(selectedCluster) }}>
                ₹{((currentStats.totalFDI || 0) / 100000).toFixed(1)}L Cr
              </div>
              <div className="cluster-stat-label">Total FDI</div>
            </div>
          </div>
        </div>

        {/* Characteristics */}
        <div className="cluster-characteristics">
          <div className="characteristics-header">
            <span className="characteristics-icon">🔍</span>
            <h3 className="characteristics-title">Key Characteristics</h3>
          </div>
          <div className="characteristics-grid">
            {currentCluster.characteristics.map((char, idx) => (
              <div className="characteristic-item" key={idx}>
                <span className="characteristic-icon">{char.icon}</span>
                <div className="characteristic-content">
                  <div className="characteristic-title">{char.title}</div>
                  <div className="characteristic-desc">{char.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section">
          <div className="recommendations-header">
            <span className="recommendations-icon">💡</span>
            <h3 className="recommendations-title">Investment Recommendations</h3>
          </div>
          <div className="recommendations-list">
            {currentCluster.recommendations.map((rec, idx) => (
              <div className="recommendation-item" key={idx}>
                <div className="recommendation-bullet">✓</div>
                <div className="recommendation-text">{rec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid-two">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">🥧 Cluster Distribution</h3>
              <span className="result-tag">{districts.length} districts</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={110}
                  label={(e) => `${e.name}: ${e.value}`}
                  labelStyle={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getClusterColor(entry.name)} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📊 Average DIRI by Cluster</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} layout="vertical" margin={{ left: 140, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                <Bar dataKey="avgDIRI" radius={[0, 6, 6, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getClusterColor(entry.name)} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart for Selected Cluster */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🎯 {selectedCluster} - Factor Profile</h3>
            <span className="result-tag">Average factor scores</span>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="factor" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
              <Radar 
                name={selectedCluster}
                dataKey="value" 
                stroke={getClusterColor(selectedCluster)} 
                fill={getClusterColor(selectedCluster)} 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Districts */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🏆 Top 10 Districts in {selectedCluster}</h3>
          </div>
          <div className="clean-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>District</th>
                  <th>State</th>
                  <th>DIRI Score</th>
                  <th>FDI (₹ Cr)</th>
                </tr>
              </thead>
              <tbody>
                {top10InCluster.map((d, idx) => (
                  <tr key={idx}>
                    <td><div className="rank-num">{idx + 1}</div></td>
                    <td className="district-col"><div className="district-name">{d.District}</div></td>
                    <td className="state-col">{d.State}</td>
                    <td>
                      <div className="score-display">
                        <div className="score-bg" style={{ width: `${d.DIRI_ML_Scaled}%`, background: getClusterColor(selectedCluster) }}></div>
                        <span className="score-num">{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="fdi-col">₹{(parseFloat(d.AllocatedFDIINR) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Districts in Cluster */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📍 All Districts in {selectedCluster}</h3>
            <span className="result-tag">{currentStats.count || 0} districts</span>
          </div>
          <div className="district-list-compact">
            {(currentStats.districts || []).map((d, idx) => (
              <div className="district-chip" key={idx}>{d.District}</div>
            ))}
          </div>
        </div>

        {/* Comparison Matrix */}
        <div className="comparison-matrix">
          <div className="card-header">
            <h3 className="card-title">📋 Cluster Comparison Matrix</h3>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Cluster</th>
                <th>Districts</th>
                <th>Avg DIRI</th>
                <th>Avg FDI/District</th>
                <th>Total FDI</th>
                <th>Infrastructure</th>
                <th>Economic</th>
                <th>Labor</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(clusterStats).map((cluster, idx) => (
                <tr key={idx}>
                  <td className="cluster-name-cell" style={{ color: getClusterColor(cluster) }}>
                    {clusterInfo[cluster]?.icon} {cluster}
                  </td>
                  <td>{clusterStats[cluster].count}</td>
                  <td><strong>{clusterStats[cluster].avgDIRI}</strong></td>
                  <td>₹{clusterStats[cluster].avgFDI} Cr</td>
                  <td>₹{((clusterStats[cluster].totalFDI || 0) / 100000).toFixed(2)}L Cr</td>
                  <td>{clusterStats[cluster].avgFactor1}</td>
                  <td>{clusterStats[cluster].avgFactor2}</td>
                  <td>{clusterStats[cluster].avgFactor3}</td>
                  <td>{clusterStats[cluster].avgFactor4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClustersPage;
