import React, { useState } from 'react';
import { Play, Atom, Leaf, Droplets, Beaker } from 'lucide-react';

function ControlPanel({ selectedMolecule, onMoleculeSelect, onRunSimulation, loading }) {
  const [simulationMethod, setSimulationMethod] = useState('vqe');
  const [agriculturalContext, setAgriculturalContext] = useState('pesticide');

  const molecules = [
    {
      id: 'water',
      name: 'Water (H₂O)',
      icon: <Droplets className="icon" />,
      description: 'Simple molecule for testing',
      rwandaRelevance: 'Irrigation efficiency studies'
    },
    {
      id: 'pesticide',
      name: 'Bio-Pesticide',
      icon: <Leaf className="icon" />,
      description: 'Environmentally safe pest control',
      rwandaRelevance: 'Fall armyworm control for maize'
    },
    {
      id: 'nutrient',
      name: 'Iron Chelate',
      icon: <Atom className="icon" />,
      description: 'Nutrient enhancement compound',
      rwandaRelevance: 'Combat iron deficiency in beans'
    }
  ];

  const simulationMethods = [
    { id: 'vqe', name: 'Quantum VQE', description: 'Variational Quantum Eigensolver' },
    { id: 'hf', name: 'Classical HF', description: 'Hartree-Fock Method' },
    { id: 'dft', name: 'DFT', description: 'Density Functional Theory' }
  ];

  const handleRunSimulation = () => {
    onRunSimulation(selectedMolecule, simulationMethod, agriculturalContext);
  };

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h3>🧪 Simulation Controls</h3>
        <p>Design molecules for Rwanda's agriculture</p>
      </div>

      {/* Molecule Selection */}
      <div className="control-section">
        <h4>Select Molecule</h4>
        <div className="molecule-grid">
          {molecules.map(molecule => (
            <div
              key={molecule.id}
              className={`molecule-card ${selectedMolecule === molecule.id ? 'selected' : ''}`}
              onClick={() => onMoleculeSelect(molecule.id)}
            >
              <div className="molecule-icon">
                {molecule.icon}
              </div>
              <div className="molecule-info">
                <h5>{molecule.name}</h5>
                <p className="description">{molecule.description}</p>
                <p className="rwanda-context">🇷🇼 {molecule.rwandaRelevance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Method */}
      <div className="control-section">
        <h4>Simulation Method</h4>
        <div className="method-selector">
          {simulationMethods.map(method => (
            <label key={method.id} className="method-option">
              <input
                type="radio"
                name="simulationMethod"
                value={method.id}
                checked={simulationMethod === method.id}
                onChange={(e) => setSimulationMethod(e.target.value)}
              />
              <span className="method-label">
                <strong>{method.name}</strong>
                <small>{method.description}</small>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Agricultural Context */}
      <div className="control-section">
        <h4>Agricultural Application</h4>
        <select 
          value={agriculturalContext}
          onChange={(e) => setAgriculturalContext(e.target.value)}
          className="context-selector"
        >
          <option value="pesticide">🐛 Pest Control</option>
          <option value="nutrient">🌱 Nutrient Enhancement</option>
          <option value="material">📦 Sustainable Materials</option>
          <option value="soil">🌍 Soil Health</option>
        </select>
      </div>

      {/* Rwanda Location Context */}
      <div className="control-section">
        <h4>Rwanda Context</h4>
        <div className="location-info">
          <div className="location-item">
            <span className="label">Target Region:</span>
            <span className="value">Kigali Province</span>
          </div>
          <div className="location-item">
            <span className="label">Crop Season:</span>
            <span className="value">Season A (Sept-Feb)</span>
          </div>
          <div className="location-item">
            <span className="label">Priority Crop:</span>
            <span className="value">Maize & Beans</span>
          </div>
        </div>
      </div>

      {/* Run Simulation Button */}
      <div className="control-section">
        <button
          className={`run-button ${loading ? 'loading' : ''}`}
          onClick={handleRunSimulation}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner small"></div>
              Running Quantum Simulation...
            </>
          ) : (
            <>
              <Play className="icon" />
              Run Molecular Simulation
            </>
          )}
        </button>
      </div>

      {/* Quick Info */}
      <div className="control-section">
        <div className="info-box">
          <h5>💡 Platform Benefits</h5>
          <ul>
            <li>Quantum-enhanced molecular precision</li>
            <li>Rwanda-specific agricultural data</li>
            <li>Environmentally safe solutions</li>
            <li>Real-time 3D visualization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;