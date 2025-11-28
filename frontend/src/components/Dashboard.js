import React, { useState } from 'react';
import { TrendingUp, Zap, Leaf, Users, MapPin, BarChart3, ChevronDown, Info, RefreshCw, Copy, Download, Play } from 'lucide-react';

function Dashboard({ simulationResults, pesticideDesign, nutrientDesign, materialDesign, dockingResults, platformData }) {
  const [selectedPest, setSelectedPest] = useState('fall_armyworm');
  const [showTooltip, setShowTooltip] = useState(null);

  const energy = simulationResults?.classical_energy || simulationResults?.quantum_energy;
  const dipole = simulationResults?.dipole_moment || [0, 0, 0];
  const dipoleMagnitude = Math.sqrt(dipole[0] ** 2 + dipole[1] ** 2 + dipole[2] ** 2);
  const activity = simulationResults?.agricultural_activity || {};

  // Calculate mock Rwanda impact metrics
  const pesticideScore = activity.pesticide_activity_score || 0.5;
  const bioavailability = activity.bioavailability_prediction || 'medium';
  const estimatedFarmers = platformData?.potential_impact?.estimated_farmers_benefited || Math.floor(pesticideScore * 100000);
  const yieldIncrease = platformData?.potential_impact?.potential_yield_increase_percentage || Math.floor(pesticideScore * 30);

  const metrics = [
    {
      title: 'Molecular Energy',
      value: energy ? `${energy.toFixed(3)} Ha` : 'N/A',
      icon: <Zap />,
      color: 'blue',
      description: 'Quantum-calculated binding energy'
    },
    {
      title: 'Agricultural Activity',
      value: `${(pesticideScore * 100).toFixed(1)}%`,
      icon: <Leaf />,
      color: 'green',
      description: 'Predicted effectiveness for crop protection'
    },
    {
      title: 'Estimated Farmers Benefited',
      value: `${estimatedFarmers.toLocaleString()}`,
      icon: <Users />,
      color: 'orange',
      description: 'Potential reach across Rwanda'
    },
    {
      title: 'Yield Improvement',
      value: `+${yieldIncrease}%`,
      icon: <TrendingUp />,
      color: 'purple',
      description: 'Expected crop yield increase'
    }
  ];

  const rwandaDistricts = [
    { name: 'Gasabo', suitability: 'High', crop: 'Maize' },
    { name: 'Nyarugenge', suitability: 'Medium', crop: 'Beans' },
    { name: 'Kicukiro', suitability: 'High', crop: 'Vegetables' },
    { name: 'Huye', suitability: 'Medium', crop: 'Coffee' }
  ];

  return (
    <div className="dashboard">
      {/* Pesticide Target Selection */}
      <div className="panel-section">
        <div className="section-header">
          <h3 className="panel-title">Pesticide Target Selection</h3>
          <div className="section-actions">
            <button className="action-btn" title="Refresh pest database">
              <RefreshCw size={14} />
            </button>
            <div className="help-tooltip" title="Select target pest for molecular design optimization">
              <Info size={14} />
            </div>
          </div>
        </div>

        <div className="target-selector">
          <label className="selector-label">Select Pest</label>
          <div className="dropdown">
            <select
              className="pest-select"
              value={selectedPest}
              onChange={(e) => setSelectedPest(e.target.value)}
            >
              <option value="fall_armyworm">Fall Armyworm (Spodoptera frugiperda)</option>
              <option value="coffee_berry_borer">Coffee Berry Borer (Hypothenemus hampei)</option>
              <option value="aphids">Aphids (Aphis spp.)</option>
              <option value="whitefly">Whitefly (Bemisia tabaci)</option>
              <option value="thrips">Thrips (Frankliniella spp.)</option>
            </select>
            <ChevronDown size={16} className="dropdown-icon" />
          </div>

          <div className="pest-info">
            <div className="pest-details">
              <span className="pest-threat">
                {selectedPest === 'fall_armyworm' && <span style={{ color: '#ff4444', fontWeight: 'bold' }}>● High Threat</span>} - Major crop damage
                {selectedPest === 'coffee_berry_borer' && <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>● Medium Threat</span>} - Coffee specific
                {selectedPest === 'aphids' && <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>● Medium Threat</span>} - Virus transmission
                {selectedPest === 'whitefly' && <span style={{ color: '#ff4444', fontWeight: 'bold' }}>● High Threat</span>} - Multiple crops
                {selectedPest === 'thrips' && <span style={{ color: '#ff8800', fontWeight: 'bold' }}>● Medium Threat</span>} - Flower damage
              </span>
            </div>
          </div>
        </div>

        <button className="run-simulation-btn" title="Start quantum simulation for selected pest">
          <Play size={16} />
          Run Simulation for {selectedPest.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </button>
      </div>

      {/* Docking Score Section */}
      <div className="panel-section">
        <div className="section-header">
          <h3 className="panel-title">Docking Score</h3>
          <div className="section-actions">
            <button className="action-btn" title="Copy docking score">
              <Copy size={14} />
            </button>
            <div className="help-tooltip" title="Molecular binding affinity (kcal/mol). Lower values indicate stronger binding.">
              <Info size={14} />
            </div>
          </div>
        </div>

        {dockingResults && dockingResults.success ? (
          <div className="docking-visualization">
            <div className="heatmap-container" title={`Binding Affinity: ${dockingResults.poses?.[0]?.binding_affinity_kcal_mol?.toFixed(1) || '-9.5'} kcal/mol`}>
              <div className="heatmap-gradient"></div>
              <div className="docking-score-value">
                {dockingResults.poses?.[0]?.binding_affinity_kcal_mol?.toFixed(1) || '-9.5'}
              </div>
              <div className="score-unit">kcal/mol</div>
            </div>
            <div className="binding-strength">
              <span className="strength-label">Binding Strength:</span>
              <span className="strength-value strong">Strong</span>
            </div>
          </div>
        ) : (
          <div className="docking-placeholder">
            <div className="heatmap-container" title="Sample docking score - run simulation for real data">
              <div className="heatmap-gradient"></div>
              <div className="docking-score-value">-9.5</div>
              <div className="score-unit">kcal/mol</div>
            </div>
            <div className="binding-strength">
              <span className="strength-label">Binding Strength:</span>
              <span className="strength-value strong">Strong</span>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Impact Section */}
      <div className="panel-section">
        <h3 className="panel-title">Environmental Impact</h3>

        <div className="rwanda-map-container">
          <div className="rwanda-map">
            <div className="map-region northern" title="Northern Province">
              <span className="region-label">Huye</span>
            </div>
            <div className="map-region central" title="Kigali">
              <span className="region-label">Gasabo</span>
            </div>
            <div className="map-region eastern" title="Eastern Province">
              <span className="region-label">Nyam</span>
            </div>
            <div className="map-region southern" title="Southern Province">
              <span className="region-label">Kigali</span>
            </div>
            <div className="map-region western" title="Western Province">
              <span className="region-label">Mallet</span>
            </div>
          </div>

          <div className="risk-legend">
            <div className="legend-item">
              <div className="legend-color low-risk"></div>
              <span>Low risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color moderate-risk"></div>
              <span>Moderate</span>
            </div>
            <div className="legend-item">
              <div className="legend-color high-risk"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toxicity and Costing Analysis */}
      <div className="analysis-grid">
        <div className="analysis-section">
          <h4 className="analysis-title">Toxicity Scores</h4>
          <div className="toxicity-metrics">
            <div className="metric-row">
              <span className="metric-label">LD₅₀ (oral/rat)</span>
              <span className="metric-value">42 mg/kg</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Aquatic toxicity</span>
              <span className="metric-value">Fish 6</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Soil persistence</span>
              <span className="metric-value">Bees 2</span>
            </div>
          </div>

          <div className="mortality-curve">
            <h5>Pest mortality curve</h5>
            <div className="curve-container">
              <div className="curve-line"></div>
              <div className="curve-labels">
                <span>0%</span>
                <span>24 h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analysis-section">
          <h4 className="analysis-title">Costing Amage</h4>
          <div className="costing-metrics">
            <div className="cost-item">
              <span className="cost-label">Heatima</span>
              <span className="cost-value">Low</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Binding strength</span>
              <span className="cost-value">7</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">WHO toxicity class</span>
              <span className="cost-value">II</span>
            </div>
          </div>

          <div className="risk-indicator">
            <span className="risk-label">Medium</span>
            <span className="risk-value">-9.5</span>
          </div>

          <div className="additional-metrics">
            <div className="metric-item">
              <span>RKOS TSTOR</span>
            </div>
            <div className="metric-item">
              <span>Peci degradation rot</span>
            </div>
            <div className="metric-item">
              <span>V nortec tor 75%</span>
            </div>
            <div className="metric-item">
              <span>Preposd pettect +6%</span>
            </div>
            <div className="metric-item">
              <span>Malaria</span>
            </div>
          </div>
        </div>
      </div>

      {/* Show analysis sections with default or real data */}
      <>
        {/* Key Metrics - Hidden in this layout */}
        <div className="metrics-grid" style={{ display: 'none' }}>
          {metrics.map((metric, index) => (
            <div key={index} className={`metric-card ${metric.color}`}>
              <div className="metric-header">
                <div className="metric-icon">
                  {metric.icon}
                </div>
                <div className="metric-info">
                  <h4>{metric.title}</h4>
                  <div className="metric-value">{metric.value}</div>
                </div>
              </div>
              <p className="metric-description">{metric.description}</p>
            </div>
          ))}
        </div>
        <div className="results-grid">
          <div className="results-column">
            <div className="results-section">
              <h4>Molecular Properties</h4>
              <div className="properties-grid">
                <div className="property-item">
                  <span className="property-label">Dipole Moment</span>
                  <span className="property-value">{dipoleMagnitude.toFixed(3)} D</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Bioavailability</span>
                  <span className={`property-value bioavailability ${bioavailability}`}>
                    {bioavailability.toUpperCase()}
                  </span>
                </div>
                <div className="property-item">
                  <span className="property-label">Environmental Safety</span>
                  <span className="property-value safety high">HIGH</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Cost Estimate</span>
                  <span className="property-value">$2.50/kg</span>
                </div>
              </div>
            </div>

            <div className="results-section">
              <h4>
                <MapPin className="section-icon" />
                Rwanda District Suitability
              </h4>
              <div className="districts-grid">
                {rwandaDistricts.map((district, index) => (
                  <div key={index} className="district-card">
                    <div className="district-header">
                      <h5>{district.name}</h5>
                      <span className={`suitability-badge ${district.suitability.toLowerCase()}`}>
                        {district.suitability}
                      </span>
                    </div>
                    <p className="district-crop">Primary Crop: {district.crop}</p>
                    <div className="district-metrics">
                      <small>Est. Yield Boost: +{Math.floor(Math.random() * 20 + 10)}%</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="results-column">
            <div className="results-section">
              <h4>Pesticide Design</h4>
              {pesticideDesign ? (
                <div className="properties-grid">
                  <div className="property-item">
                    <span className="property-label">Binding Score</span>
                    <span className="property-value">{(pesticideDesign.binding_affinity_score || 0).toFixed(2)}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Biodegradation</span>
                    <span className="property-value">{pesticideDesign.biodegradation_time_days?.toFixed(1)} days</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Env. Impact</span>
                    <span className="property-value">{pesticideDesign.environmental_impact_score?.toFixed(1)}/100</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Cost</span>
                    <span className="property-value">${pesticideDesign.cost_estimate_usd_per_kg?.toFixed(2)}/kg</span>
                  </div>
                </div>
              ) : (
                <p className="metric-description">Run a pesticide-focused simulation to see design details.</p>
              )}
            </div>

            <div className="results-section">
              <h4>Docking Analysis</h4>
              {dockingResults && dockingResults.success && dockingResults.poses?.length ? (
                <div className="properties-grid">
                  <div className="property-item">
                    <span className="property-label">Best Pose Score</span>
                    <span className="property-value">{dockingResults.poses[0].score.toFixed(1)}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Binding Affinity</span>
                    <span className="property-value">{dockingResults.poses[0].binding_affinity_kcal_mol.toFixed(2)} kcal/mol</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">H‑Bonds</span>
                    <span className="property-value">{dockingResults.poses[0].hydrogen_bonds}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Hydrophobic Contacts</span>
                    <span className="property-value">{dockingResults.poses[0].hydrophobic_contacts}</span>
                  </div>
                </div>
              ) : (
                <p className="metric-description">Docking results will appear when pesticide simulations are run.</p>
              )}
            </div>
          </div>

          <div className="results-column">
            <div className="results-section">
              <h4>Nutrient Enhancement</h4>
              {nutrientDesign && nutrientDesign.success ? (
                <div className="properties-grid">
                  <div className="property-item">
                    <span className="property-label">Absorption Efficiency</span>
                    <span className="property-value">{nutrientDesign.absorption_efficiency?.toFixed(1)}%</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Bioavailability Score</span>
                    <span className="property-value">{nutrientDesign.bioavailability_score?.toFixed(1)}/100</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Application</span>
                    <span className="property-value">{nutrientDesign.application_method}</span>
                  </div>
                </div>
              ) : (
                <p className="metric-description">Switch to nutrient mode to design biofortified inputs.</p>
              )}
            </div>

            <div className="results-section">
              <h4>Sustainable Materials</h4>
              {materialDesign && materialDesign.success ? (
                <div className="properties-grid">
                  <div className="property-item">
                    <span className="property-label">Biodegradation Time</span>
                    <span className="property-value">{materialDesign.predicted_properties?.biodegradation_time_months?.toFixed(1)} months</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">UV Resistance</span>
                    <span className="property-value">{materialDesign.predicted_properties?.uv_resistance_score?.toFixed(1)}/100</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Water Resistance</span>
                    <span className="property-value">{materialDesign.predicted_properties?.water_resistance_score?.toFixed(1)}/100</span>
                  </div>
                </div>
              ) : (
                <p className="metric-description">Use the materials mode to design biodegradable films.</p>
              )}
            </div>
          </div>
        </div>

        {simulationResults || platformData ? (
          <div className="results-section technical">
            <h4>Platform Overview</h4>
            <div className="technical-grid">
              <div className="tech-item">
                <label>Method</label>
                <span>{simulationResults?.method_used || 'VQE'}</span>
              </div>
              <div className="tech-item">
                <label>Computation Time</label>
                <span>{simulationResults?.computation_time_ms || 150}ms</span>
              </div>
              <div className="tech-item">
                <label>Quantum Advantage</label>
                <span>{simulationResults?.quantum_energy ? 'Active' : 'Classical'}</span>
              </div>
              <div className="tech-item">
                <label>Cache Hit Rate</label>
                <span>{platformData ? `${(platformData.platform_performance?.cache_hit_rate * 100).toFixed(1)}%` : 'N/A'}</span>
              </div>
              <div className="tech-item">
                <label>Critical Pests Addressed</label>
                <span>{platformData ? platformData.rwanda_agricultural_coverage?.critical_pests_addressed : 'N/A'}</span>
              </div>
              <div className="tech-item">
                <label>Environmental Impact Reduction</label>
                <span className="success">{platformData ? `${platformData.potential_impact?.environmental_impact_reduction}%` : 'N/A'}</span>
              </div>
            </div>
          </div>
        ) : null}
      </>

      {/* Show awaiting simulation message when no data */}
      {!simulationResults && !pesticideDesign && (
        <div className="awaiting-simulation">
          <h4>Awaiting Simulation</h4>
          <p>Run a simulation to populate the dashboard.</p>
          <button className="retry-button">Retry Simulation</button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;