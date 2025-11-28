import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Play, TrendingUp, Zap, Layers, BarChart3, ArrowRight, Atom, Target, Settings, Download } from 'lucide-react';

const AdvancedSimulations = forwardRef(({ backendUrl, selectedMolecule }, ref) => {
  const [activeSimulation, setActiveSimulation] = useState('bond_scan');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  
  // Bond Scan State
  const [bondScanParams, setBondScanParams] = useState({
    atom1: 0,
    atom2: 1,
    startDistance: 0.5,
    endDistance: 3.0,
    steps: 20,
    method: 'hf'
  });

  // Geometry Optimization State
  const [geometryParams, setGeometryParams] = useState({
    method: 'hf',
    maxIterations: 50,
    convergenceThreshold: 1e-6
  });

  // Transition State State
  const [transitionParams, setTransitionParams] = useState({
    reactantMolecule: 'H2O',
    productMolecule: 'H2O',
    method: 'hf'
  });

  // Material Properties State
  const [materialParams, setMaterialParams] = useState({
    numRepeats: 2,
    propertyType: 'mechanical',
    temperature: 298.15
  });

  const simulationTypes = {
    bond_scan: {
      title: 'Bond Distance Scanning',
      icon: TrendingUp,
      description: 'Analyze how molecular energy changes with bond distance',
      color: '#3b82f6'
    },
    geometry_opt: {
      title: 'Geometry Optimization',
      icon: Target,
      description: 'Find the most stable molecular configuration',
      color: '#10b981'
    },
    transition_state: {
      title: 'Transition State Finding',
      icon: Zap,
      description: 'Locate transition states between reactants and products',
      color: '#f59e0b'
    },
    material_props: {
      title: 'Material Properties',
      icon: Layers,
      description: 'Predict bulk material properties from molecular structure',
      color: '#8b5cf6'
    }
  };

  const getMoleculeString = () => {
    if (!selectedMolecule) return 'H2O';
    if (typeof selectedMolecule === 'string') return selectedMolecule;
    if (selectedMolecule.molecule_string) return selectedMolecule.molecule_string;
    if (selectedMolecule.name) return selectedMolecule.name;
    return 'H2O';
  };

const runBondScan = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${backendUrl}/run_bond_scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        molecule_string: getMoleculeString(),
        atom_indices: [bondScanParams.atom1, bondScanParams.atom2],
        start_distance: bondScanParams.startDistance,
        end_distance: bondScanParams.endDistance,
        steps: bondScanParams.steps,
        method: bondScanParams.method
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Transform the backend response to match frontend expectations
    const transformedData = {
      success: data.success,
      scan_data: data.scan_points?.map(point => ({
        distance: point.distance,
        energy: point.energy
      })) || [],
      minimum_energy: data.scan_points?.reduce((min, point) => 
        point.energy !== null ? Math.min(min, point.energy) : min, 
        Number.MAX_SAFE_INTEGER
      ),
      optimal_distance: data.optimal_bond_distance
    };
    
    setResults(prev => ({ ...prev, bond_scan: transformedData }));
  } catch (error) {
    console.error('Bond scan failed:', error);
    setResults(prev => ({ ...prev, bond_scan: { error: error.message } }));
  }
  setLoading(false);
};

  const runGeometryOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/optimize_geometry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          molecule_string: getMoleculeString(),
          method: geometryParams.method,
          max_iterations: geometryParams.maxIterations,
          convergence_threshold: geometryParams.convergenceThreshold
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResults(prev => ({ ...prev, geometry_opt: data }));
    } catch (error) {
      console.error('Geometry optimization failed:', error);
      setResults(prev => ({ ...prev, geometry_opt: { error: error.message } }));
    }
    setLoading(false);
  };

  const runTransitionStateSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/find_transition_state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactant_string: transitionParams.reactantMolecule,
          product_string: transitionParams.productMolecule,
          method: transitionParams.method
        })
      });
      
      const data = await response.json();
      setResults(prev => ({ ...prev, transition_state: data }));
    } catch (error) {
      console.error('Transition state search failed:', error);
      setResults(prev => ({ ...prev, transition_state: { error: error.message } }));
    }
    setLoading(false);
  };

  const runMaterialProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/predict_material_properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          molecule_string: getMoleculeString(),
          num_repeats: materialParams.numRepeats,
          temperature: materialParams.temperature
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResults(prev => ({ ...prev, material_props: data }));
    } catch (error) {
      console.error('Material properties prediction failed:', error);
      setResults(prev => ({ ...prev, material_props: { error: error.message } }));
    }
    setLoading(false);
  };

  const runSimulation = () => {
    switch (activeSimulation) {
      case 'bond_scan':
        runBondScan();
        break;
      case 'geometry_opt':
        runGeometryOptimization();
        break;
      case 'transition_state':
        runTransitionStateSearch();
        break;
      case 'material_props':
        runMaterialProperties();
        break;
      default:
        break;
    }
  };

  // Expose runSimulation to parent via ref
  useImperativeHandle(ref, () => ({
    runSimulation: runSimulation,
    setActiveSimulation: setActiveSimulation
  }));

  const renderParameterPanel = () => {
    switch (activeSimulation) {
      case 'bond_scan':
        return (
          <div className="parameter-panel">
            <h4>Bond Scan Parameters</h4>
            <div className="param-grid">
              <div className="param-group">
                <label>Atom 1 Index:</label>
                <input
                  type="number"
                  value={bondScanParams.atom1}
                  onChange={(e) => setBondScanParams(prev => ({ ...prev, atom1: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
              <div className="param-group">
                <label>Atom 2 Index:</label>
                <input
                  type="number"
                  value={bondScanParams.atom2}
                  onChange={(e) => setBondScanParams(prev => ({ ...prev, atom2: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
              <div className="param-group">
                <label>Start Distance (Å):</label>
                <input
                  type="number"
                  step="0.1"
                  value={bondScanParams.startDistance}
                  onChange={(e) => setBondScanParams(prev => ({ ...prev, startDistance: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="param-group">
                <label>End Distance (Å):</label>
                <input
                  type="number"
                  step="0.1"
                  value={bondScanParams.endDistance}
                  onChange={(e) => setBondScanParams(prev => ({ ...prev, endDistance: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="param-group">
                <label>Steps:</label>
                <input
                  type="number"
                  value={bondScanParams.steps}
                  onChange={(e) => setBondScanParams(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                  min="5"
                  max="100"
                />
              </div>
              <div className="param-group">
                <label>Method:</label>
                <select
                  value={bondScanParams.method}
                  onChange={(e) => setBondScanParams(prev => ({ ...prev, method: e.target.value }))}
                >
                  <option value="hf">Hartree-Fock</option>
                  <option value="dft">DFT</option>
                  <option value="mp2">MP2</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'geometry_opt':
        return (
          <div className="parameter-panel">
            <h4>Geometry Optimization Parameters</h4>
            <div className="param-grid">
              <div className="param-group">
                <label>Method:</label>
                <select
                  value={geometryParams.method}
                  onChange={(e) => setGeometryParams(prev => ({ ...prev, method: e.target.value }))}
                >
                  <option value="hf">Hartree-Fock</option>
                  <option value="dft">DFT</option>
                  <option value="mp2">MP2</option>
                </select>
              </div>
              <div className="param-group">
                <label>Max Iterations:</label>
                <input
                  type="number"
                  value={geometryParams.maxIterations}
                  onChange={(e) => setGeometryParams(prev => ({ ...prev, maxIterations: parseInt(e.target.value) }))}
                  min="10"
                  max="200"
                />
              </div>
              <div className="param-group">
                <label>Convergence Threshold:</label>
                <select
                  value={geometryParams.convergenceThreshold}
                  onChange={(e) => setGeometryParams(prev => ({ ...prev, convergenceThreshold: parseFloat(e.target.value) }))}
                >
                  <option value={1e-4}>1e-4 (Loose)</option>
                  <option value={1e-6}>1e-6 (Normal)</option>
                  <option value={1e-8}>1e-8 (Tight)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'transition_state':
        return (
          <div className="parameter-panel">
            <h4>Transition State Parameters</h4>
            <div className="param-grid">
              <div className="param-group">
                <label>Reactant Molecule:</label>
                <input
                  type="text"
                  value={transitionParams.reactantMolecule}
                  onChange={(e) => setTransitionParams(prev => ({ ...prev, reactantMolecule: e.target.value }))}
                  placeholder="e.g., H2O"
                />
              </div>
              <div className="param-group">
                <label>Product Molecule:</label>
                <input
                  type="text"
                  value={transitionParams.productMolecule}
                  onChange={(e) => setTransitionParams(prev => ({ ...prev, productMolecule: e.target.value }))}
                  placeholder="e.g., H2O"
                />
              </div>
              <div className="param-group">
                <label>Method:</label>
                <select
                  value={transitionParams.method}
                  onChange={(e) => setTransitionParams(prev => ({ ...prev, method: e.target.value }))}
                >
                  <option value="hf">Hartree-Fock</option>
                  <option value="dft">DFT</option>
                  <option value="mp2">MP2</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'material_props':
        return (
          <div className="parameter-panel">
            <h4>Material Properties Parameters</h4>
            <div className="param-grid">
              <div className="param-group">
                <label>Number of Repeats:</label>
                <input
                  type="number"
                  value={materialParams.numRepeats}
                  onChange={(e) => setMaterialParams(prev => ({ ...prev, numRepeats: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                />
              </div>
              <div className="param-group">
                <label>Temperature (K):</label>
                <input
                  type="number"
                  step="0.1"
                  value={materialParams.temperature}
                  onChange={(e) => setMaterialParams(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  min="0"
                />
              </div>
              <div className="param-group">
                <label>Property Type:</label>
                <select
                  value={materialParams.propertyType}
                  onChange={(e) => setMaterialParams(prev => ({ ...prev, propertyType: e.target.value }))}
                >
                  <option value="mechanical">Mechanical</option>
                  <option value="thermal">Thermal</option>
                  <option value="electrical">Electrical</option>
                  <option value="optical">Optical</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    const currentResult = results[activeSimulation];
    if (!currentResult) return null;

    if (currentResult.error) {
      return (
        <div className="results-panel error">
          <h4>Simulation Error</h4>
          <p>{currentResult.error}</p>
        </div>
      );
    }

    switch (activeSimulation) {
      case 'bond_scan':
        return (
          <div className="results-panel">
            <h4>Bond Scan Results</h4>
            {currentResult.success && (
              <div className="bond-scan-results">
                <div className="result-summary">
                  <div className="metric">
                    <span className="label">Minimum Energy:</span>
                    <span className="value">{currentResult.minimum_energy?.toFixed(6)} Hartree</span>
                  </div>
                  <div className="metric">
                    <span className="label">Optimal Distance:</span>
                    <span className="value">{currentResult.optimal_distance?.toFixed(3)} Å</span>
                  </div>
                  <div className="metric">
                    <span className="label">Data Points:</span>
                    <span className="value">{currentResult.scan_data?.length || 0}</span>
                  </div>
                </div>
                {currentResult.scan_data && (
                  <div className="scan-plot">
                    <h5>Energy vs Distance Plot</h5>
                    <div className="plot-placeholder">
                      <BarChart3 size={48} />
                      <p>Interactive plot would be rendered here</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'geometry_opt':
        return (
          <div className="results-panel">
            <h4>Geometry Optimization Results</h4>
            {currentResult.success && (
              <div className="geometry-results">
                <div className="result-summary">
                  <div className="metric">
                    <span className="label">Final Energy:</span>
                    <span className="value">{currentResult.final_energy?.toFixed(6)} Hartree</span>
                  </div>
                  <div className="metric">
                    <span className="label">Iterations:</span>
                    <span className="value">{currentResult.iterations}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Converged:</span>
                    <span className="value">{currentResult.converged ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="geometry-comparison">
                  <h5>Before vs After Optimization</h5>
                  <div className="comparison-placeholder">
                    <Atom size={48} />
                    <ArrowRight size={24} />
                    <Atom size={48} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'transition_state':
        return (
          <div className="results-panel">
            <h4>Transition State Results</h4>
            {currentResult.success && (
              <div className="transition-results">
                <div className="result-summary">
                  <div className="metric">
                    <span className="label">Activation Energy:</span>
                    <span className="value">{currentResult.activation_energy?.toFixed(6)} Hartree</span>
                  </div>
                  <div className="metric">
                    <span className="label">Reaction Coordinate:</span>
                    <span className="value">{currentResult.reaction_coordinate?.toFixed(3)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Imaginary Frequency:</span>
                    <span className="value">{currentResult.imaginary_frequency?.toFixed(1)} cm⁻¹</span>
                  </div>
                </div>
                <div className="energy-profile">
                  <h5>Reaction Energy Profile</h5>
                  <div className="profile-placeholder">
                    <TrendingUp size={48} />
                    <p>Energy profile plot would be rendered here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'material_props':
        return (
          <div className="results-panel">
            <h4>Material Properties Results</h4>
            {currentResult.success && (
              <div className="material-results">
                <div className="properties-grid">
                  <div className="property-card">
                    <h5>Mechanical Properties</h5>
                    <div className="property-list">
                      <div className="property">
                        <span>Young's Modulus:</span>
                        <span>{currentResult.youngs_modulus?.toFixed(2)} GPa</span>
                      </div>
                      <div className="property">
                        <span>Bulk Modulus:</span>
                        <span>{currentResult.bulk_modulus?.toFixed(2)} GPa</span>
                      </div>
                      <div className="property">
                        <span>Density:</span>
                        <span>{currentResult.density?.toFixed(3)} g/cm³</span>
                      </div>
                    </div>
                  </div>
                  <div className="property-card">
                    <h5>Thermal Properties</h5>
                    <div className="property-list">
                      <div className="property">
                        <span>Thermal Conductivity:</span>
                        <span>{currentResult.thermal_conductivity?.toFixed(3)} W/mK</span>
                      </div>
                      <div className="property">
                        <span>Heat Capacity:</span>
                        <span>{currentResult.heat_capacity?.toFixed(2)} J/molK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="advanced-simulations">
      <div className="simulation-header">
        <h2>Advanced Quantum Simulations</h2>
        <p>Perform sophisticated molecular analysis and property predictions</p>
      </div>

      <div className="simulation-types">
        {Object.entries(simulationTypes).map(([key, sim]) => {
          const IconComponent = sim.icon;
          return (
            <button
              key={key}
              className={`simulation-type ${activeSimulation === key ? 'active' : ''}`}
              onClick={() => setActiveSimulation(key)}
              style={{ borderColor: sim.color }}
            >
              <IconComponent size={24} style={{ color: sim.color }} />
              <div className="sim-info">
                <h4>{sim.title}</h4>
                <p>{sim.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="simulation-workspace">
        <div className="parameters-section">
          {renderParameterPanel()}
          <button
            className="run-simulation-btn"
            onClick={runSimulation}
            disabled={loading}
            style={{ backgroundColor: simulationTypes[activeSimulation].color }}
          >
            {loading ? (
              <>
                <Settings className="spinning" size={20} />
                Running...
              </>
            ) : (
              <>
                <Play size={20} />
                Run {simulationTypes[activeSimulation].title}
              </>
            )}
          </button>
        </div>

        <div className="results-section">
          {renderResults()}
        </div>
      </div>
    </div>
  );
});

AdvancedSimulations.displayName = 'AdvancedSimulations';

export default AdvancedSimulations;
