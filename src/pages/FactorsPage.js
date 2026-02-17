import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import './PageStyles.css';
import './FactorsPage.css';

function FactorsPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedFactor, setSelectedFactor] = useState('Factor1');

  useEffect(() => {
    fetch('/data/Final_DIRI_Rankings_All_Districts.json')
      .then(r => r.json())
      .then(data => setDistricts(data));
  }, []);

  const factorInfo = {
    Factor1: {
      name: 'Infrastructure Development',
      weight: 69.3,
      color: '#3b82f6',
      icon: '🏗️',
      description: 'Measures physical infrastructure including transportation networks, connectivity, industrial zones, power supply, and logistics capabilities. This is the dominant factor influencing FDI decisions.',
      components: [
        { icon: '🛣️', title: 'Road Networks', desc: 'Highway connectivity and road quality' },
        { icon: '🚂', title: 'Rail & Metro', desc: 'Railway infrastructure and urban transit' },
        { icon: '✈️', title: 'Air Connectivity', desc: 'Airport accessibility and flight frequency' },
        { icon: '⚡', title: 'Power & Utilities', desc: 'Electricity supply and industrial utilities' }
      ]
    },
    Factor2: {
      name: 'Economic Capacity',
      weight: 14.2,
      color: '#8b5cf6',
      icon: '🏭',
      description: 'Evaluates the economic base including GDP contribution, industrial output, financial institutions presence, market size, and purchasing power of the region.',
      components: [
        { icon: '💹', title: 'GDP Contribution', desc: 'Regional economic output and growth' },
        { icon: '🏪', title: 'Market Size', desc: 'Consumer base and purchasing power' },
        { icon: '🏦', title: 'Banking Access', desc: 'Financial institutions and credit availability' },
        { icon: '📊', title: 'Industrial Output', desc: 'Manufacturing and production capacity' }
      ]
    },
    Factor3: {
      name: 'Labor Quality',
      weight: 8.9,
      color: '#10b981',
      icon: '👥',
      description: 'Assesses workforce characteristics including skill levels, educational attainment, technical training availability, and labor productivity metrics.',
      components: [
        { icon: '🎓', title: 'Education Level', desc: 'Literacy rates and higher education access' },
        { icon: '🔧', title: 'Technical Skills', desc: 'Vocational training and specialized skills' },
        { icon: '💼', title: 'Experience', desc: 'Industry experience and productivity' },
        { icon: '🏫', title: 'Training Centers', desc: 'Skill development infrastructure' }
      ]
    },
    Factor4: {
      name: 'Enterprise Maturity',
      weight: 7.5,
      color: '#f59e0b',
      icon: '⚙️',
      description: 'Analyzes business ecosystem maturity including MSME density, startup ecosystem, ease of doing business, regulatory efficiency, and entrepreneurial culture.',
      components: [
        { icon: '🏢', title: 'MSME Density', desc: 'Small and medium enterprise concentration' },
        { icon: '🚀', title: 'Startup Ecosystem', desc: 'Innovation hubs and incubators' },
        { icon: '📋', title: 'Compliance Ease', desc: 'Regulatory processes and efficiency' },
        { icon: '🤝', title: 'Business Networks', desc: 'Industry associations and partnerships' }
      ]
    }
  };

  const factorData = [
    { factor: 'Infrastructure', weight: 69.3, color: '#3b82f6' },
    { factor: 'Economic Capacity', weight: 14.2, color: '#8b5cf6' },
    { factor: 'Labor Quality', weight: 8.9, color: '#10b981' },
    { factor: 'Enterprise Maturity', weight: 7.5, color: '#f59e0b' }
  ];

  // Get top districts by selected factor
  const topByFactor = [...districts]
    .sort((a, b) => (parseFloat(b[selectedFactor]) || 0) - (parseFloat(a[selectedFactor]) || 0))
    .slice(0, 20);

  // Calculate factor statistics
  const factorStats = districts.length > 0 ? {
    avg: (districts.reduce((sum, d) => sum + (parseFloat(d[selectedFactor]) || 0), 0) / districts.length).toFixed(2),
    max: Math.max(...districts.map(d => parseFloat(d[selectedFactor]) || 0)).toFixed(2),
    min: Math.min(...districts.map(d => parseFloat(d[selectedFactor]) || 0)).toFixed(2),
    median: parseFloat(districts[Math.floor(districts.length / 2)][selectedFactor] || 0).toFixed(2)
  } : { avg: 0, max: 0, min: 0, median: 0 };

  // Top 10 for comparison chart
  const top10Comparison = topByFactor.slice(0, 10);

  // Create radar chart data for top 5
  const radarData = ['Factor1', 'Factor2', 'Factor3', 'Factor4'].map(factor => {
    const obj = { factor: factorInfo[factor].name };
    topByFactor.slice(0, 5).forEach((d, idx) => {
      obj[`D${idx + 1}`] = parseFloat(d[factor]) || 0;
    });
    return obj;
  });

  // Factor correlation with DIRI
  const correlationData = topByFactor.slice(0, 15).map(d => ({
    district: d.District,
    factor: parseFloat(d[selectedFactor]) || 0,
    diri: parseFloat(d.DIRI_ML_Scaled) || 0
  }));

  const currentFactor = factorInfo[selectedFactor];

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
            <div className="clean-icon">🔬</div>
            <div>
              <h1 className="clean-title">Factor Analysis</h1>
              <p className="clean-subtitle">ML-optimized Ridge Regression factor weights (α=1.53, R²=0.82)</p>
            </div>
          </div>
        </div>

        {/* Factor Selector */}
        <div className="factor-selector">
          <div className="factor-selector-header">Select Factor to Analyze</div>
          <div className="factor-buttons">
            {Object.keys(factorInfo).map(key => (
              <button
                key={key}
                className={`factor-button ${selectedFactor === key ? 'active' : ''}`}
                onClick={() => setSelectedFactor(key)}
                style={{ color: factorInfo[key].color }}
              >
                <div className="factor-button-icon" style={{ 
                  background: `${factorInfo[key].color}15`,
                  color: factorInfo[key].color 
                }}>
                  {factorInfo[key].icon}
                </div>
                <div className="factor-button-content">
                  <div className="factor-button-name">{factorInfo[key].name}</div>
                  <div className="factor-button-weight" style={{ color: factorInfo[key].color }}>
                    {factorInfo[key].weight}%
                  </div>
                  <div className="factor-button-label">Weight</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Factor Details */}
        <div className="factor-details" style={{ borderColor: currentFactor.color }}>
          <div className="factor-details-header">
            <div className="factor-details-icon" style={{ 
              background: `${currentFactor.color}15`,
              color: currentFactor.color 
            }}>
              {currentFactor.icon}
            </div>
            <div className="factor-details-content">
              <h3>{currentFactor.name}</h3>
              <div className="factor-details-meta">
                <span>Weight: <strong>{currentFactor.weight}%</strong></span>
                <span>•</span>
                <span>Analyzing {districts.length} districts</span>
              </div>
            </div>
          </div>
          <p className="factor-details-description">{currentFactor.description}</p>
          
          <div className="factor-metrics">
            <div className="factor-metric">
              <div className="factor-metric-value" style={{ color: currentFactor.color }}>{factorStats.avg}</div>
              <div className="factor-metric-label">Average</div>
            </div>
            <div className="factor-metric">
              <div className="factor-metric-value" style={{ color: currentFactor.color }}>{factorStats.max}</div>
              <div className="factor-metric-label">Maximum</div>
            </div>
            <div className="factor-metric">
              <div className="factor-metric-value" style={{ color: currentFactor.color }}>{factorStats.median}</div>
              <div className="factor-metric-label">Median</div>
            </div>
            <div className="factor-metric">
              <div className="factor-metric-value" style={{ color: currentFactor.color }}>{factorStats.min}</div>
              <div className="factor-metric-label">Minimum</div>
            </div>
          </div>
        </div>

        {/* Components Breakdown */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🔍 {currentFactor.name} Components</h3>
          </div>
          <div className="factor-breakdown">
            {currentFactor.components.map((comp, idx) => (
              <div className="breakdown-item" key={idx} style={{ borderLeftColor: currentFactor.color }}>
                <div className="breakdown-icon" style={{ 
                  background: `${currentFactor.color}15`,
                  color: currentFactor.color 
                }}>
                  {comp.icon}
                </div>
                <div className="breakdown-content">
                  <div className="breakdown-title">{comp.title}</div>
                  <div className="breakdown-description">{comp.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Factor Distribution */}
        <div className="charts-grid-two">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">🥧 Overall Factor Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie 
                  data={factorData} 
                  dataKey="weight" 
                  nameKey="factor" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={110} 
                  label={(e) => `${e.factor}: ${e.weight}%`}
                  labelStyle={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
                >
                  {factorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📊 Weight Comparison</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={factorData} layout="vertical" margin={{ left: 140, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="factor" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
                  {factorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 by Selected Factor */}
        <div className="factor-comparison-grid">
          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">{currentFactor.icon} Top 10 Districts - {currentFactor.name}</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10Comparison} margin={{ bottom: 80, left: 20, right: 20 }}>
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
                <Bar dataKey={selectedFactor} name={currentFactor.name} fill={currentFactor.color} radius={[6, 6, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="clean-card">
            <div className="card-header">
              <h3 className="card-title">📈 Factor vs DIRI Correlation</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={correlationData} margin={{ bottom: 80, left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="district" 
                  angle={-35} 
                  textAnchor="end" 
                  height={90} 
                  stroke="#475569" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                <Legend />
                <Line type="monotone" dataKey="factor" stroke={currentFactor.color} strokeWidth={2} dot={{ fill: currentFactor.color, r: 4 }} name={currentFactor.name} />
                <Line type="monotone" dataKey="diri" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="DIRI Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart - Top 5 Districts All Factors */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">🎯 Top 5 Districts - All Factors Comparison</h3>
            <span className="result-tag">Multi-dimensional view</span>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="factor" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
              {topByFactor.slice(0, 5).map((d, idx) => (
                <Radar
                  key={idx}
                  name={d.District}
                  dataKey={`D${idx + 1}`}
                  stroke={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][idx]}
                  fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][idx]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Findings */}
        <div className="key-findings">
          <div className="key-findings-header">
            <span className="key-findings-icon">💡</span>
            <h3 className="key-findings-title">Key Findings - {currentFactor.name}</h3>
          </div>
          <div className="findings-list">
            <div className="finding-item">
              <div className="finding-bullet">1</div>
              <div className="finding-text">
                <span className="finding-highlight">{topByFactor[0]?.District}</span> leads in {currentFactor.name} with a score of <span className="finding-highlight">{parseFloat(topByFactor[0]?.[selectedFactor] || 0).toFixed(2)}</span>, significantly above the average of {factorStats.avg}.
              </div>
            </div>
            <div className="finding-item">
              <div className="finding-bullet">2</div>
              <div className="finding-text">
                This factor contributes <span className="finding-highlight">{currentFactor.weight}%</span> to the overall DIRI score, making it {currentFactor.weight > 50 ? 'the most critical' : currentFactor.weight > 10 ? 'a significant' : 'an important'} determinant of FDI allocation.
              </div>
            </div>
            <div className="finding-item">
              <div className="finding-bullet">3</div>
              <div className="finding-text">
                The correlation between {currentFactor.name} and final DIRI scores shows {currentFactor.weight > 50 ? 'strong alignment' : 'moderate influence'}, with top-performing districts averaging <span className="finding-highlight">{(top10Comparison.reduce((sum, d) => sum + parseFloat(d.DIRI_ML_Scaled || 0), 0) / top10Comparison.length).toFixed(1)}</span> DIRI points.
              </div>
            </div>
            <div className="finding-item">
              <div className="finding-bullet">4</div>
              <div className="finding-text">
                Districts with high {currentFactor.name} scores demonstrate {currentFactor.weight > 50 ? 'dominant market positioning' : 'competitive advantages'} in attracting foreign investments, particularly in {selectedFactor === 'Factor1' ? 'manufacturing and logistics sectors' : selectedFactor === 'Factor2' ? 'finance and commerce' : selectedFactor === 'Factor3' ? 'services and technology' : 'entrepreneurship and innovation'}.
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">📋 Top 20 Districts by {currentFactor.name}</h3>
          </div>
          <div className="clean-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>District</th>
                  <th>State</th>
                  <th>{currentFactor.name}</th>
                  <th>DIRI Score</th>
                  <th>FDI (₹ Cr)</th>
                </tr>
              </thead>
              <tbody>
                {topByFactor.map((d, idx) => (
                  <tr key={idx}>
                    <td><div className="rank-num">{idx + 1}</div></td>
                    <td className="district-col"><div className="district-name">{d.District}</div></td>
                    <td className="state-col">{d.State}</td>
                    <td>
                      <div className="score-display">
                        <div className="score-bg" style={{ width: `${(parseFloat(d[selectedFactor]) / parseFloat(factorStats.max)) * 100}%`, background: currentFactor.color }}></div>
                        <span className="score-num">{parseFloat(d[selectedFactor]).toFixed(2)}</span>
                      </div>
                    </td>
                    <td><span className="score-num">{parseFloat(d.DIRI_ML_Scaled).toFixed(1)}</span></td>
                    <td className="fdi-col">₹{(parseFloat(d.AllocatedFDIINR) / 100).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
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

export default FactorsPage;
