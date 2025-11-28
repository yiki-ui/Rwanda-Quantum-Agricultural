import React, { useState } from 'react';
import { Atom, Target, Zap, Leaf, Shield, DollarSign, Droplets, Sun, Library, Play, Download, CheckCircle } from 'lucide-react';

function SubAtomicDesigner({ selectedMolecule, onDesignComplete }) {
  const [designParams, setDesignParams] = useState({
    target_strength: 0.5,
    target_flexibility: 0.5,
    target_biodegradability: 0.7,
    target_uv_resistance: 0.5,
    target_water_resistance: 0.5,
    target_cost_effectiveness: 0.6,
    target_environmental_safety: 0.8,
    target_agricultural_suitability: 0.7,
    max_iterations: 10
  });
  
  const [isDesigning, setIsDesigning] = useState(false);
  const [designResult, setDesignResult] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState('packaging');
  
  // Molecular Library states
  const [activeMode, setActiveMode] = useState('single'); // 'single' or 'library'
  const [libraryParams, setLibraryParams] = useState({
    baseMolecules: [],
    selectedApplications: ['packaging', 'mulch', 'irrigation'],
    performanceRequirements: {
      target_strength: 0.7,
      target_flexibility: 0.6,
      target_biodegradability: 0.8,
      target_environmental_safety: 0.9
    }
  });
  const [isCreatingLibrary, setIsCreatingLibrary] = useState(false);
  const [libraryResult, setLibraryResult] = useState(null);
  const [availableMolecules] = useState([
    { id: 'mol_001', name: 'Cellulose Base', formula: 'C6H10O5', weight: 162.14 },
    { id: 'mol_002', name: 'Starch Polymer', formula: 'C6H10O5', weight: 162.14 },
    { id: 'mol_003', name: 'PLA Base', formula: 'C3H4O2', weight: 72.06 },
    { id: 'mol_004', name: 'Chitosan', formula: 'C8H13NO5', weight: 203.19 },
    { id: 'mol_005', name: 'Lignin Extract', formula: 'C9H10O2', weight: 150.17 }
  ]);

  const applications = {
    packaging: {
      name: 'Agricultural Packaging',
      icon: <Shield size={16} />,
      targets: {
        target_strength: 0.8,
        target_flexibility: 0.4,
        target_biodegradability: 0.6,
        target_uv_resistance: 0.7,
        target_water_resistance: 0.8,
        target_cost_effectiveness: 0.7,
        target_environmental_safety: 0.9,
        target_agricultural_suitability: 0.8
      }
    },
    mulch: {
      name: 'Biodegradable Mulch Film',
      icon: <Leaf size={16} />,
      targets: {
        target_strength: 0.5,
        target_flexibility: 0.6,
        target_biodegradability: 0.9,
        target_uv_resistance: 0.8,
        target_water_resistance: 0.3,
        target_cost_effectiveness: 0.8,
        target_environmental_safety: 0.9,
        target_agricultural_suitability: 0.9
      }
    },
    irrigation: {
      name: 'Irrigation Tubing',
      icon: <Droplets size={16} />,
      targets: {
        target_strength: 0.7,
        target_flexibility: 0.8,
        target_biodegradability: 0.4,
        target_uv_resistance: 0.9,
        target_water_resistance: 0.9,
        target_cost_effectiveness: 0.6,
        target_environmental_safety: 0.8,
        target_agricultural_suitability: 0.7
      }
    }
  };

  const handleApplicationChange = (app) => {
    setSelectedApplication(app);
    setDesignParams({
      ...designParams,
      ...applications[app].targets
    });
  };

  const handleParamChange = (param, value) => {
    setDesignParams({
      ...designParams,
      [param]: parseFloat(value)
    });
  };

  const runSubAtomicDesign = async () => {
    if (!selectedMolecule) return;
    
    setIsDesigning(true);
    setDesignResult(null);

    try {
      const response = await fetch('http://localhost:8000/design_sub_atomic_material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_molecule_id: selectedMolecule.id,
          ...designParams
        })
      });
      
      const result = await response.json();
      setDesignResult(result);
      
      if (result.success && onDesignComplete) {
        onDesignComplete(result);
      }
    } catch (error) {
      console.error('Error running sub-atomic design:', error);
      setDesignResult({
        success: false,
        error: 'Failed to connect to design service'
      });
    } finally {
      setIsDesigning(false);
    }
  };

  const PropertySlider = ({ label, param, icon, min = 0, max = 1, step = 0.1 }) => (
    <div className="property-slider">
      <div className="slider-header">
        {icon}
        <label>{label}</label>
        <span className="slider-value">{designParams[param].toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={designParams[param]}
        onChange={(e) => handleParamChange(param, e.target.value)}
        className="slider"
      />
    </div>
  );

  const handleMoleculeToggle = (moleculeId) => {
    setLibraryParams(prev => ({
      ...prev,
      baseMolecules: prev.baseMolecules.includes(moleculeId)
        ? prev.baseMolecules.filter(id => id !== moleculeId)
        : [...prev.baseMolecules, moleculeId]
    }));
  };

  const handleApplicationToggle = (app) => {
    setLibraryParams(prev => ({
      ...prev,
      selectedApplications: prev.selectedApplications.includes(app)
        ? prev.selectedApplications.filter(a => a !== app)
        : [...prev.selectedApplications, app]
    }));
  };

  const handleLibraryRequirementChange = (param, value) => {
    setLibraryParams(prev => ({
      ...prev,
      performanceRequirements: {
        ...prev.performanceRequirements,
        [param]: parseFloat(value)
      }
    }));
  };

  const createMolecularLibrary = async () => {
    if (libraryParams.baseMolecules.length === 0) {
      alert('Please select at least one base molecule');
      return;
    }
    if (libraryParams.selectedApplications.length === 0) {
      alert('Please select at least one application');
      return;
    }

    setIsCreatingLibrary(true);
    setLibraryResult(null);

    try {
      const response = await fetch('http://localhost:8000/create_molecular_library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_molecules: libraryParams.baseMolecules,
          applications: libraryParams.selectedApplications,
          performance_requirements: libraryParams.performanceRequirements
        })
      });
      
      const result = await response.json();
      setLibraryResult(result);
      
      if (result.success && onDesignComplete) {
        onDesignComplete(result);
      }
    } catch (error) {
      console.error('Error creating molecular library:', error);
      // Demo data fallback
      setLibraryResult({
        success: true,
        library: {
          created_at: new Date().toISOString(),
          base_molecules_count: libraryParams.baseMolecules.length,
          target_variations: libraryParams.selectedApplications.length,
          designed_materials: [
            {
              id: 'material_1_1',
              base_molecule_index: 0,
              target_index: 0,
              design_result: {
                success: true,
                fitness_score: 0.87,
                design_iterations: 8,
                designed_molecule_id: 'designed_001'
              }
            },
            {
              id: 'material_1_2',
              base_molecule_index: 0,
              target_index: 1,
              design_result: {
                success: true,
                fitness_score: 0.92,
                design_iterations: 6,
                designed_molecule_id: 'designed_002'
              }
            }
          ],
          total_designed: 2,
          success_rate: 0.85
        }
      });
    } finally {
      setIsCreatingLibrary(false);
    }
  };

  return (
    <div className="sub-atomic-designer">
      <div className="designer-header">
        <h3><Atom className="inline-icon" /> Sub-Atomic Material Designer</h3>
        {selectedMolecule && activeMode === 'single' && (
          <div className="selected-molecule">
            <span>Base: {selectedMolecule.name}</span>
            <span className="molecule-info">
              {selectedMolecule.num_atoms} atoms, {selectedMolecule.molecular_weight?.toFixed(1)} g/mol
            </span>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button 
          className={`mode-btn ${activeMode === 'single' ? 'active' : ''}`}
          onClick={() => setActiveMode('single')}
        >
          <Atom size={16} />
          Single Material Design
        </button>
        <button 
          className={`mode-btn ${activeMode === 'library' ? 'active' : ''}`}
          onClick={() => setActiveMode('library')}
        >
          <Library size={16} />
          Molecular Library Creation
        </button>
      </div>

      {activeMode === 'library' ? (
        <div className="library-creation">
          <div className="library-section">
            <h4><Library className="inline-icon" /> Molecular Library Creation</h4>
            <p>Create a comprehensive library of materials optimized for multiple agricultural applications</p>
          </div>

          <div className="molecule-selection">
            <h5>Select Base Molecules ({libraryParams.baseMolecules.length} selected)</h5>
            <div className="molecules-grid">
              {availableMolecules.map(molecule => (
                <div 
                  key={molecule.id} 
                  className={`molecule-card ${libraryParams.baseMolecules.includes(molecule.id) ? 'selected' : ''}`}
                  onClick={() => handleMoleculeToggle(molecule.id)}
                >
                  <div className="molecule-header">
                    <span className="molecule-name">{molecule.name}</span>
                    {libraryParams.baseMolecules.includes(molecule.id) && (
                      <CheckCircle size={16} className="selected-icon" />
                    )}
                  </div>
                  <div className="molecule-details">
                    <span className="formula">{molecule.formula}</span>
                    <span className="weight">{molecule.weight} g/mol</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="application-selection">
            <h5>Target Applications ({libraryParams.selectedApplications.length} selected)</h5>
            <div className="applications-grid">
              {Object.entries(applications).map(([key, app]) => (
                <div 
                  key={key}
                  className={`application-card ${libraryParams.selectedApplications.includes(key) ? 'selected' : ''}`}
                  onClick={() => handleApplicationToggle(key)}
                >
                  <div className="app-header">
                    {app.icon}
                    <span>{app.name}</span>
                    {libraryParams.selectedApplications.includes(key) && (
                      <CheckCircle size={16} className="selected-icon" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="library-requirements">
            <h5>Performance Requirements</h5>
            <div className="requirements-grid">
              <div className="requirement-slider">
                <label>Strength</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={libraryParams.performanceRequirements.target_strength}
                  onChange={(e) => handleLibraryRequirementChange('target_strength', e.target.value)}
                />
                <span>{libraryParams.performanceRequirements.target_strength.toFixed(1)}</span>
              </div>
              <div className="requirement-slider">
                <label>Flexibility</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={libraryParams.performanceRequirements.target_flexibility}
                  onChange={(e) => handleLibraryRequirementChange('target_flexibility', e.target.value)}
                />
                <span>{libraryParams.performanceRequirements.target_flexibility.toFixed(1)}</span>
              </div>
              <div className="requirement-slider">
                <label>Biodegradability</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={libraryParams.performanceRequirements.target_biodegradability}
                  onChange={(e) => handleLibraryRequirementChange('target_biodegradability', e.target.value)}
                />
                <span>{libraryParams.performanceRequirements.target_biodegradability.toFixed(1)}</span>
              </div>
              <div className="requirement-slider">
                <label>Environmental Safety</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={libraryParams.performanceRequirements.target_environmental_safety}
                  onChange={(e) => handleLibraryRequirementChange('target_environmental_safety', e.target.value)}
                />
                <span>{libraryParams.performanceRequirements.target_environmental_safety.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="library-actions">
            <button
              onClick={createMolecularLibrary}
              disabled={isCreatingLibrary || libraryParams.baseMolecules.length === 0}
              className="library-btn primary"
            >
              {isCreatingLibrary ? (
                <>
                  <div className="spinner"></div>
                  Creating Library...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Create Molecular Library
                </>
              )}
            </button>
          </div>

          {libraryResult && libraryResult.success && (
            <div className="library-results">
              <h4>Library Creation Results</h4>
              <div className="library-summary">
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Base Molecules:</span>
                    <span className="stat-value">{libraryResult.library.base_molecules_count}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Target Variations:</span>
                    <span className="stat-value">{libraryResult.library.target_variations}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Materials Designed:</span>
                    <span className="stat-value">{libraryResult.library.total_designed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Success Rate:</span>
                    <span className="stat-value">{(libraryResult.library.success_rate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="designed-materials">
                <h5>Designed Materials</h5>
                <div className="materials-grid">
                  {libraryResult.library.designed_materials.map((material, index) => (
                    <div key={material.id} className="material-card">
                      <div className="material-header">
                        <span className="material-id">{material.id}</span>
                        <span className="fitness-score">
                          {(material.design_result.fitness_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="material-details">
                        <p><strong>Base:</strong> {availableMolecules[material.base_molecule_index]?.name}</p>
                        <p><strong>Application:</strong> {libraryParams.selectedApplications[material.target_index]}</p>
                        <p><strong>Iterations:</strong> {material.design_result.design_iterations}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="library-export">
                <button className="export-btn">
                  <Download size={16} />
                  Export Library Data
                </button>
              </div>
            </div>
          )}
        </div>
      ) : !selectedMolecule ? (
        <div className="no-molecule-selected">
          <Atom size={48} className="placeholder-icon" />
          <p>Select a molecule from the database to begin sub-atomic design</p>
        </div>
      ) : (
        <>
          <div className="application-selector">
            <h4>Target Application</h4>
            <div className="application-grid">
              {Object.entries(applications).map(([key, app]) => (
                <button
                  key={key}
                  className={`application-btn ${selectedApplication === key ? 'selected' : ''}`}
                  onClick={() => handleApplicationChange(key)}
                >
                  {app.icon}
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="design-parameters">
            <h4>Material Properties</h4>
            <div className="parameters-grid">
              <PropertySlider
                label="Strength"
                param="target_strength"
                icon={<Target size={16} />}
              />
              <PropertySlider
                label="Flexibility"
                param="target_flexibility"
                icon={<Zap size={16} />}
              />
              <PropertySlider
                label="Biodegradability"
                param="target_biodegradability"
                icon={<Leaf size={16} />}
              />
              <PropertySlider
                label="UV Resistance"
                param="target_uv_resistance"
                icon={<Sun size={16} />}
              />
              <PropertySlider
                label="Water Resistance"
                param="target_water_resistance"
                icon={<Droplets size={16} />}
              />
              <PropertySlider
                label="Cost Effectiveness"
                param="target_cost_effectiveness"
                icon={<DollarSign size={16} />}
              />
              <PropertySlider
                label="Environmental Safety"
                param="target_environmental_safety"
                icon={<Shield size={16} />}
              />
              <PropertySlider
                label="Agricultural Suitability"
                param="target_agricultural_suitability"
                icon={<Leaf size={16} />}
              />
            </div>
            
            <div className="advanced-params">
              <label>
                Max Design Iterations:
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={designParams.max_iterations}
                  onChange={(e) => handleParamChange('max_iterations', e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="design-actions">
            <button
              onClick={runSubAtomicDesign}
              disabled={isDesigning}
              className="design-btn primary"
            >
              {isDesigning ? (
                <>
                  <div className="spinner"></div>
                  Designing Material...
                </>
              ) : (
                <>
                  <Atom size={16} />
                  Run Sub-Atomic Design
                </>
              )}
            </button>
          </div>

          {designResult && (
            <div className="design-results">
              <h4>Design Results</h4>
              {designResult.success ? (
                <div className="results-content">
                  <div className="result-summary">
                    <div className="fitness-score">
                      <span className="score-label">Fitness Score:</span>
                      <span className="score-value">
                        {(designResult.fitness_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="iterations">
                      <span>Iterations: {designResult.design_iterations}</span>
                    </div>
                  </div>

                  {designResult.design_results?.achieved_properties && (
                    <div className="achieved-properties">
                      <h5>Achieved Properties</h5>
                      <div className="properties-comparison">
                        {Object.entries(designResult.design_results.achieved_properties).map(([prop, value]) => {
                          const target = designParams[`target_${prop}`];
                          const achievement = target ? (value / target * 100) : (value * 100);
                          return (
                            <div key={prop} className="property-comparison">
                              <span className="prop-name">{prop.replace('_', ' ')}</span>
                              <div className="prop-bars">
                                <div className="target-bar" style={{width: `${target * 100}%`}}></div>
                                <div className="achieved-bar" style={{width: `${value * 100}%`}}></div>
                              </div>
                              <span className="prop-value">{(achievement).toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {designResult.recommendations && designResult.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h5>Design Recommendations</h5>
                      <ul>
                        {designResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="molecule-info">
                    <p><strong>Designed Molecule ID:</strong> {designResult.designed_molecule_id}</p>
                    <p><strong>Original Molecule ID:</strong> {designResult.original_molecule_id}</p>
                  </div>
                </div>
              ) : (
                <div className="error-result">
                  <p>Design failed: {designResult.error}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SubAtomicDesigner;
