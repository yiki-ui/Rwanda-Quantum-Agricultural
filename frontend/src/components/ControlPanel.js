import React, { useState } from 'react';
import { Play, Atom, Leaf, Droplets, Plus, Link, Eye, BarChart3, ChevronDown, RotateCcw, ZoomIn, Move } from 'lucide-react';
import Interactive3DMolecule from './Interactive3DMolecule';

function ControlPanel({ selectedMolecule, onMoleculeSelect, onRunSimulation, loading, simulationResults, pesticideDesign, nutrientDesign, materialDesign, dockingResults, platformData }) {
  const [targetPest, setTargetPest] = useState('fall_armyworm');
  const [agriculturalContext] = useState('pesticide');
  const [viewerHeight, setViewerHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);

  const handleRunSimulation = () => {
    onRunSimulation(selectedMolecule, 'vqe', agriculturalContext, {
      targetPest,
      cropType: 'maize',
      safetyLevel: 'high',
      district: 'Gasabo',
    });
  };

  const getDefaultMoleculeData = (moleculeType) => {
    const defaultMolecules = {
      water: [
        { symbol: 'O', x: 0, y: 0, z: 0, atom_id: 0 },
        { symbol: 'H', x: 0.76, y: 0.59, z: 0, atom_id: 1 },
        { symbol: 'H', x: -0.76, y: 0.59, z: 0, atom_id: 2 }
      ],
      pesticide: [
        { symbol: 'C', x: 0, y: 0, z: 0, atom_id: 0 },
        { symbol: 'C', x: 1.4, y: 0, z: 0, atom_id: 1 },
        { symbol: 'N', x: 2.8, y: 0, z: 0, atom_id: 2 },
        { symbol: 'O', x: 1.4, y: 1.4, z: 0, atom_id: 3 },
        { symbol: 'Cl', x: 0, y: -1.4, z: 0, atom_id: 4 },
        { symbol: 'H', x: 2.8, y: 1.4, z: 0, atom_id: 5 }
      ],
      nutrient: [
        { symbol: 'C', x: 0, y: 0, z: 0, atom_id: 0 },
        { symbol: 'N', x: 1.4, y: 0, z: 0, atom_id: 1 },
        { symbol: 'N', x: 2.8, y: 0, z: 0, atom_id: 2 },
        { symbol: 'O', x: 1.4, y: 1.4, z: 0, atom_id: 3 },
        { symbol: 'Fe', x: 4.2, y: 0.7, z: 0, atom_id: 4 }
      ]
    };
    return defaultMolecules[moleculeType] || defaultMolecules.water;
  };

  const getUniqueAtoms = (moleculeType, simResults) => {
    const atomData = simResults?.atom_data || getDefaultMoleculeData(moleculeType);
    const uniqueSymbols = [...new Set(atomData.map(atom => atom.symbol))];
    return uniqueSymbols.map(symbol => ({ symbol }));
  };

  const getAtomColor = (symbol) => {
    const colors = {
      H: '#FFFFFF', C: '#404040', N: '#3050F8', O: '#FF0D0D',
      P: '#FF8000', S: '#FFFF30', Cl: '#1FF01F', F: '#90E050',
      Fe: '#E06633', Zn: '#7D80B0', Ca: '#3DFF00', Mg: '#8AFF00'
    };
    return colors[symbol] || '#404040';
  };

  const getAtomName = (symbol) => {
    const names = {
      H: 'Hydrogen', C: 'Carbon', N: 'Nitrogen', O: 'Oxygen',
      P: 'Phosphorus', S: 'Sulfur', Cl: 'Chlorine', F: 'Fluorine',
      Fe: 'Iron', Zn: 'Zinc', Ca: 'Calcium', Mg: 'Magnesium'
    };
    return names[symbol] || 'Unknown';
  };

  // Handle resize functionality
  const handleResizeStart = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    
    const centerPanel = document.querySelector('.center-panel-modern');
    if (!centerPanel) return;
    
    const rect = centerPanel.getBoundingClientRect();
    const newHeight = Math.max(250, Math.min(800, e.clientY - rect.top - 100));
    setViewerHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Handle scroll fade effect
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const maxScroll = 100; // Adjust this value to control fade sensitivity
    const opacity = Math.max(0.3, 1 - (scrollTop / maxScroll));
    setScrollOpacity(opacity);
  };

  // Handle molecule selection with proper state management
  const handleMoleculeSelect = (moleculeType) => {
    onMoleculeSelect(moleculeType);
    // Note: We don't clear simulationResults here as the parent component manages that
  };

  // Add event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize]);

  return (
    <div className="modern-dashboard">
      {/* Left Panel - Molecule Builder */}
      <div className="left-panel-modern">
        <div className="panel-section-modern">
          <h3 className="section-title">Molecule Builder</h3>
          
          <div className="builder-controls-grid">
            <button className="builder-btn-modern" title="Add atoms to build custom molecules">
              <Plus size={16} />
              <span>Add Atom</span>
            </button>
            <button className="builder-btn-modern" title="Connect atoms with chemical bonds">
              <Link size={16} />
              <span>Add Bond</span>
            </button>
            <button className="builder-btn-modern" title="Auto-optimize molecular structure">
              <Eye size={16} />
              <span>Auto</span>
            </button>
          </div>
          
          <button className="generate-preview-btn-modern">
            Generate 3D Preview
          </button>
        </div>

        {/* Simulation Results Section */}
        <div className="panel-section-modern">
          <h3 className="section-title">Simulation Results</h3>
          
          {simulationResults ? (
            <div className="results-metrics-modern">
              <div className="metric-row-modern">
                <span className="metric-label-modern">Molc Energy</span>
                <span className="metric-value-modern">
                  {simulationResults?.classical_energy ? `${simulationResults.classical_energy.toFixed(1)} Ha` : '-76.3 Ha'}
                </span>
              </div>
              <div className="metric-row-modern">
                <span className="metric-label-modern">UV Stability</span>
                <span className="metric-value-modern">
                  {pesticideDesign?.predicted_properties?.uv_resistance_score ? 
                    `${pesticideDesign.predicted_properties.uv_resistance_score.toFixed(0)}%` : '72%'}
                </span>
              </div>
              <div className="metric-row-modern">
                <span className="metric-label-modern">Rainfastness</span>
                <span className="metric-value-modern">
                  {pesticideDesign?.predicted_properties?.water_resistance_score ? 
                    `${pesticideDesign.predicted_properties.water_resistance_score.toFixed(0)}%` : '65%'}
                </span>
              </div>
              <div className="metric-row-modern">
                <span className="metric-label-modern">Soil Binding Strength</span>
                <span className="metric-value-modern">
                  {pesticideDesign?.binding_affinity_score ? 
                    pesticideDesign.binding_affinity_score.toFixed(0) : '80'}
                </span>
              </div>
              <div className="metric-row-modern">
                <span className="metric-label-modern">Leaf Absorption</span>
                <span className="metric-value-modern">
                  {simulationResults?.agricultural_activity?.pesticide_activity_score ? 
                    `${(simulationResults.agricultural_activity.pesticide_activity_score * 100).toFixed(0)}%` : '78%'}
                </span>
              </div>
              
              {/* Progress Chart */}
              <div className="progress-chart-modern">
                <div className="chart-label-modern">80%</div>
                <div className="chart-line-modern"></div>
                <div className="chart-labels-modern">
                  <span>0%</span>
                  <span>24 h</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-results-modern">
              <BarChart3 size={32} opacity={0.5} />
              <p>Run simulation to see results</p>
            </div>
          )}
        </div>

        {/* Rwanda Impact Section */}
        <div className="panel-section-modern">
          <h3 className="section-title">Rwanda Impact</h3>
          
          <div className="impact-metrics-modern">
            <div className="metric-row-modern">
              <span className="metric-label-modern">Agricultural activity</span>
              <span className="metric-value-modern">34,000</span>
            </div>
            <div className="metric-row-modern">
              <span className="metric-label-modern">Estimated esm per kg</span>
              <span className="metric-value-modern">18</span>
            </div>
            <div className="metric-row-modern">
              <span className="metric-label-modern">Cost per hectare former</span>
              <span className="metric-value-modern">$18</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - 3D Molecular Visualization */}
      <div className="center-panel-modern" onScroll={handleScroll}>
        <div className="visualization-header">
          <h3 className="section-title">3D Molecular Visualization</h3>
          
          {/* Molecule Selection Buttons */}
          <div className="molecule-selector">
            <button 
              className={`molecule-btn ${selectedMolecule === 'water' ? 'active' : ''}`}
              onClick={() => handleMoleculeSelect('water')}
            >
              <Droplets size={16} />
              Water
            </button>
            <button 
              className={`molecule-btn ${selectedMolecule === 'pesticide' ? 'active' : ''}`}
              onClick={() => handleMoleculeSelect('pesticide')}
            >
              <Leaf size={16} />
              Pesticide
            </button>
            <button 
              className={`molecule-btn ${selectedMolecule === 'nutrient' ? 'active' : ''}`}
              onClick={() => handleMoleculeSelect('nutrient')}
            >
              <Atom size={16} />
              Nutrient
            </button>
          </div>
        </div>
        
        <div 
          className="molecule-viewer-modern" 
          style={{ 
            height: `${viewerHeight}px`,
            opacity: scrollOpacity,
            transition: 'opacity 0.3s ease'
          }}
        >
          {/* 3D Molecule Display Area */}
          <div className="molecule-display">
            {selectedMolecule ? (
              <Interactive3DMolecule 
                atomData={simulationResults?.atom_data || getDefaultMoleculeData(selectedMolecule)}
                selectedMolecule={selectedMolecule}
              />
            ) : (
              <div className="no-molecule">
                <Atom size={48} />
                <p>Select a molecule to visualize</p>
              </div>
            )}
          </div>
          
          {/* Resize Handle */}
          <div 
            className="resize-handle"
            onMouseDown={handleResizeStart}
            title="Drag to resize 3D viewer"
          >
            <div className="resize-indicator">⋮⋮⋮</div>
          </div>
        </div>
        
        <div className="viewer-controls-modern">
          <div className="control-instructions-modern">
            <div className="instruction-item-modern">
              <RotateCcw size={16} />
              <span>Drag to rotate</span>
            </div>
            <div className="instruction-item-modern">
              <ZoomIn size={16} />
              <span>Scroll to zoom</span>
            </div>
            <div className="instruction-item-modern">
              <Move size={16} />
              <span>Shift+Drag to pan</span>
            </div>
            <div className="instruction-item-modern">
              <Move size={16} />
              <span>Drag bottom to resize</span>
            </div>
            <button 
              className="reset-view-btn"
              onClick={() => {
                // Reset view - this will be passed to the 3D component
                if (window.resetMoleculeView) {
                  window.resetMoleculeView();
                }
              }}
              title="Reset view to center"
            >
              <Eye size={14} />
              Reset View
            </button>
          </div>
          
          {/* Atom Properties Legend */}
          {selectedMolecule && (
            <div className="atom-properties">
              {getUniqueAtoms(selectedMolecule, simulationResults).map(atom => (
                <div key={atom.symbol} className="atom-property">
                  <div 
                    className="atom-color-indicator" 
                    style={{ backgroundColor: getAtomColor(atom.symbol) }}
                  ></div>
                  <span>{atom.symbol} - {getAtomName(atom.symbol)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simulation Results Display */}
        {(simulationResults || selectedMolecule) && (
          <div className="simulation-results-container">
            <div className="simulation-results-header">
              <h4 className="analysis-title">Simulation Results</h4>
              <div className="scroll-indicator">
                <span>Scroll for more ↓</span>
              </div>
            </div>
            <div className="simulation-results-scrollable">
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Energy</span>
                  <span className="result-value">{simulationResults?.classical_energy?.toFixed(3) || 'Run simulation'} Ha</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Method</span>
                  <span className="result-value">{simulationResults?.method_used || 'VQE'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Dipole</span>
                  <span className="result-value">
                    {simulationResults?.dipole_moment ? 
                      `${Math.sqrt(simulationResults.dipole_moment.reduce((sum, val) => sum + val*val, 0)).toFixed(2)} D` : 
                      'Pending'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Atoms</span>
                  <span className="result-value">{simulationResults?.atom_data?.length || getDefaultMoleculeData(selectedMolecule).length}</span>
                </div>
                
                {/* Additional detailed results */}
                <div className="result-item">
                  <span className="result-label">Quantum Energy</span>
                  <span className="result-value">{simulationResults?.quantum_energy?.toFixed(3) || 'Pending'} Ha</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Computation Time</span>
                  <span className="result-value">{simulationResults?.computation_time_ms || 'Pending'} ms</span>
                </div>
                
                {/* Molecular Properties */}
                <div className="result-section-header">
                  <span>Molecular Properties</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Molecular Weight</span>
                  <span className="result-value">{simulationResults?.molecular_weight?.toFixed(2) || 'Pending'} g/mol</span>
                </div>
                <div className="result-item">
                  <span className="result-label">HOMO Energy</span>
                  <span className="result-value">{simulationResults?.homo_energy?.toFixed(3) || 'Pending'} eV</span>
                </div>
                <div className="result-item">
                  <span className="result-label">LUMO Energy</span>
                  <span className="result-value">{simulationResults?.lumo_energy?.toFixed(3) || 'Pending'} eV</span>
                </div>
                
                {/* Agricultural Activity */}
                {simulationResults?.agricultural_activity && (
                  <>
                    <div className="result-section-header">
                      <span>Agricultural Activity</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Pesticide Activity</span>
                      <span className="result-value">
                        {(simulationResults?.agricultural_activity?.pesticide_activity_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Bioavailability</span>
                      <span className="result-value">{simulationResults?.agricultural_activity?.bioavailability_prediction}</span>
                    </div>
                  </>
                )}
                
                {/* Atom Data Details */}
                <div className="result-section-header">
                  <span>Atomic Coordinates</span>
                </div>
                {simulationResults?.atom_data?.slice(0, 5).map((atom, index) => (
                  <div key={index} className="result-item atom-detail">
                    <span className="result-label">{atom.symbol} {index + 1}</span>
                    <span className="result-value">
                      ({atom.x?.toFixed(3)}, {atom.y?.toFixed(3)}, {atom.z?.toFixed(3)})
                    </span>
                  </div>
                ))}
                
                {simulationResults?.atom_data?.length > 5 && (
                  <div className="result-item">
                    <span className="result-label">More atoms...</span>
                    <span className="result-value">+{simulationResults.atom_data.length - 5} atoms</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Sections */}
        <div className="analysis-sections">
          <div className="analysis-section-modern">
            <h4 className="analysis-title">Toxicity Scores</h4>
            <div className="toxicity-metrics-modern">
              <div className="metric-item-modern">
                <span>LD₅₀ (oral/rat)</span>
                <span>
                  {pesticideDesign?.toxicity_profile?.mammalian_toxicity === 'low' ? '42 mg/kg' : 
                   pesticideDesign?.toxicity_profile?.mammalian_toxicity === 'moderate' ? '28 mg/kg' : '42 mg/kg'}
                </span>
              </div>
              <div className="metric-item-modern">
                <span>Aquatic toxicity</span>
                <span>
                  {pesticideDesign?.toxicity_profile?.aquatic_toxicity === 'low' ? 'Fish 6' : 
                   pesticideDesign?.toxicity_profile?.aquatic_toxicity === 'moderate' ? 'Fish 4' : 'Fish 6'}
                </span>
              </div>
              <div className="metric-item-modern">
                <span>Soil persistence</span>
                <span>
                  {pesticideDesign?.toxicity_profile?.soil_persistence === 'low' ? 'Bees 2' : 
                   pesticideDesign?.toxicity_profile?.soil_persistence === 'moderate' ? 'Bees 3' : 'Bees 2'}
                </span>
              </div>
            </div>
            
            <div className="mortality-curve-modern">
              <h5>Pest mortality curve</h5>
              <div className="curve-container-modern">
                <div className="curve-line-modern"></div>
                <div className="curve-labels-modern">
                  <span>0%</span>
                  <span>24 h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="analysis-section-modern">
            <h4 className="analysis-title">Costing Analysis</h4>
            <div className="costing-metrics-modern">
              <div className="metric-item-modern">
                <span>Cost Impact</span>
                <span className="cost-low">
                  {pesticideDesign?.cost_estimate_usd_per_kg ? 
                    (pesticideDesign.cost_estimate_usd_per_kg < 50 ? 'Low' : 
                     pesticideDesign.cost_estimate_usd_per_kg < 100 ? 'Medium' : 'High') : 'Low'}
                </span>
              </div>
              <div className="metric-item-modern">
                <span>Binding strength</span>
                <span>
                  {pesticideDesign?.binding_affinity_score ? 
                    Math.round(pesticideDesign.binding_affinity_score / 10) : '7'}
                </span>
              </div>
              <div className="metric-item-modern">
                <span>WHO toxicity class</span>
                <span>
                  {pesticideDesign?.toxicity_profile?.mammalian_toxicity === 'low' ? 'III' : 
                   pesticideDesign?.toxicity_profile?.mammalian_toxicity === 'moderate' ? 'II' : 'II'}
                </span>
              </div>
            </div>
            
            <div className="risk-indicator-modern">
              <span>
                {pesticideDesign?.environmental_impact_score ? 
                  (pesticideDesign.environmental_impact_score > 70 ? 'Low' : 
                   pesticideDesign.environmental_impact_score > 50 ? 'Medium' : 'High') : 'Medium'}
              </span>
              <span>
                {dockingResults?.best_binding_affinity ? 
                  dockingResults.best_binding_affinity.toFixed(1) : 
                  pesticideDesign?.binding_affinity_score ? 
                  `-${pesticideDesign.binding_affinity_score.toFixed(1)}` : '-9.5'}
              </span>
            </div>
            
            <div className="additional-info">
              <div className="info-row">
                <span>ROI for farmer</span>
                <span>
                  {pesticideDesign?.cost_estimate_usd_per_kg ? 
                    `${(100 / pesticideDesign.cost_estimate_usd_per_kg * 1.4).toFixed(1)}` : '1.4'}
                </span>
              </div>
              <div className="info-row">
                <span>Expected nation yield</span>
                <span>
                  {pesticideDesign?.efficacy_prediction ? 
                    `${(pesticideDesign.efficacy_prediction * 100).toFixed(0)}%` : '75%'}
                </span>
              </div>
              <div className="info-row">
                <span>Peci degradation</span>
                <span>
                  {pesticideDesign?.biodegradation_time_days ? 
                    `${pesticideDesign.biodegradation_time_days.toFixed(0)}d` : '75%'}
                </span>
              </div>
              <div className="info-row">
                <span>V protection</span>
                <span>+6%</span>
              </div>
              <div className="info-row">
                <span>Malaria vector control</span>
                <span>
                  {targetPest === 'mosquito' || agriculturalContext === 'vector_control' ? 'Active' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Pesticide Target Selection */}
      <div className="right-panel-modern">
        <div className="panel-section-modern">
          <h3 className="section-title">Pesticide Target Selection</h3>
          
          <div className="target-selection-modern">
            <div className="dropdown-modern">
              <select 
                value={targetPest}
                onChange={(e) => setTargetPest(e.target.value)}
                className="pest-selector-modern"
              >
                <option value="fall_armyworm">Select Pest</option>
                <option value="fall_armyworm">Fall armyworm</option>
                <option value="aphids">Aphids</option>
                <option value="coffee_berry_borer">Coffee berry borer</option>
              </select>
              <ChevronDown className="dropdown-icon-modern" size={16} />
            </div>
          </div>
          
          <button 
            className="run-simulation-btn-modern"
            onClick={handleRunSimulation}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner small"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Docking Score Section */}
        <div className="panel-section-modern">
          <h3 className="section-title">Docking Score</h3>
          
          <div className="docking-score-container">
            <div className="heatmap-modern">
              <div className="heatmap-gradient-modern"></div>
              <div className="docking-score-overlay">
                <span className="score-value">
                  {dockingResults?.best_binding_affinity ? 
                    dockingResults.best_binding_affinity.toFixed(1) : 
                    pesticideDesign?.binding_affinity_score ? 
                    `-${pesticideDesign.binding_affinity_score.toFixed(1)}` : 
                    '-9.5'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact Section */}
        <div className="panel-section-modern">
          <h3 className="section-title">Environmental Impact</h3>
          
          <div className="rwanda-map-modern">
            <div className="map-container">
              <div className="map-region northern">Nyagatare</div>
              <div className="map-region central">Gasabo</div>
              <div className="map-region eastern">Kayonza</div>
              <div className="map-region southern">Huye</div>
              <div className="map-region western">Rusizi</div>
            </div>
            
            <div className="risk-legend-modern">
              <div className="legend-item-modern">
                <div className="legend-color low-risk"></div>
                <span>Low risk</span>
              </div>
              <div className="legend-item-modern">
                <div className="legend-color moderate-risk"></div>
                <span>Moderate</span>
              </div>
              <div className="legend-item-modern">
                <div className="legend-color high-risk"></div>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;