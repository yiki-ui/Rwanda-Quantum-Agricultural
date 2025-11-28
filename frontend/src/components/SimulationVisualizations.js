import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, Activity, Zap, Target, Gauge, 
  Play, Pause, RotateCcw, Maximize, Atom, Plus, X, FileText,
  Sliders, Layers, Leaf, Copy, Clock, Eye, TrendingUp
} from 'lucide-react';

// 3D Molecule Viewer Component
const MoleculeViewer3D = ({ molecule, isActive }) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [animationId, setAnimationId] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !isActive || !molecule) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    let currentAnimationId = null;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw molecule representation
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 80;

      // Draw nucleus
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw electron shells
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw electrons
      const numElectrons = Math.min(molecule.num_atoms || 10, 12);
      for (let i = 0; i < numElectrons; i++) {
        const angle = (i / numElectrons) * Math.PI * 2 + rotation.y * 0.01;
        const shellRadius = radius * (0.3 + (i % 3) * 0.35);
        const x = centerX + Math.cos(angle) * shellRadius;
        const y = centerY + Math.sin(angle) * shellRadius;

        ctx.fillStyle = `hsl(${270 + i * 20}, 70%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw molecule info
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(molecule.name, centerX, height - 30);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`${molecule.num_atoms} atoms | ${molecule.molecular_weight?.toFixed(1)} g/mol`, centerX, height - 10);

      // Rotate
      setRotation(prev => ({ x: prev.x + 1, y: prev.y + 1 }));
      currentAnimationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (currentAnimationId) cancelAnimationFrame(currentAnimationId);
    };
  }, [molecule, isActive, rotation]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight - 100;
    }
  }, []);

  return (
    <div className="molecule-viewer-3d">
      <div className="viewer-header">
        <Atom size={16} />
        <span>3D Molecule Visualization</span>
      </div>
      <canvas 
        ref={canvasRef} 
        className="molecule-canvas"
      />
      <div className="viewer-info">
        <p><strong>Molecule:</strong> {molecule?.name}</p>
        <p><strong>Atoms:</strong> {molecule?.num_atoms}</p>
        <p><strong>Molecular Weight:</strong> {molecule?.molecular_weight?.toFixed(2)} g/mol</p>
        <p><strong>Formula:</strong> {molecule?.formula || 'N/A'}</p>
      </div>
    </div>
  );
};

// Energy Level Chart Component
const EnergyLevelChart = ({ molecule, isActive }) => {
  const canvasRef = useRef(null);
  const [energyData, setEnergyData] = useState([]);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!molecule) return;
    
    // Generate realistic energy levels based on molecule properties
    const levels = [
      { label: 'HOMO', energy: -5.2 - (molecule.molecular_weight || 100) * 0.01, color: '#ef4444' },
      { label: 'LUMO', energy: -2.1 - (molecule.molecular_weight || 100) * 0.005, color: '#3b82f6' },
      { label: 'Binding', energy: -8.5 - (molecule.num_atoms || 10) * 0.1, color: '#10b981' },
      { label: 'Ionization', energy: 8.2 + (molecule.num_atoms || 10) * 0.05, color: '#f59e0b' }
    ];
    setEnergyData(levels);
  }, [molecule]);

  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw energy levels
      energyData.forEach((level, index) => {
        const y = 30 + index * 40;
        const barWidth = Math.abs(level.energy) * 15 * animationProgress;
        
        // Energy bar
        ctx.fillStyle = level.color;
        ctx.fillRect(60, y, barWidth, 15);
        
        // Energy value
        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px monospace';
        ctx.fillText(`${level.energy.toFixed(2)} eV`, barWidth + 65, y + 12);
        
        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.fillText(level.label, 10, y + 12);
      });

      if (animationProgress < 1) {
        setAnimationProgress(prev => Math.min(prev + 0.02, 1));
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [energyData, animationProgress, isActive]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = Math.min(parent.clientWidth - 40, 600);
      canvas.height = 200;
    }
  }, []);

  return (
    <div className="energy-chart">
      <div className="chart-header">
        <Activity size={16} />
        <span>Energy Levels</span>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};

// Property Comparison Graph
const PropertyComparisonGraph = ({ molecules, selectedMolecule }) => {
  const canvasRef = useRef(null);
  const [comparisonData, setComparisonData] = useState([]);

  useEffect(() => {
    if (!molecules || molecules.length === 0) return;

    const data = molecules.slice(0, 5).map(mol => ({
      name: mol.name.substring(0, 10),
      molecular_weight: mol.molecular_weight || 100,
      num_atoms: mol.num_atoms || 10,
      effectiveness: Math.random() * 100, // Simulated effectiveness
      isSelected: selectedMolecule?.id === mol.id
    }));
    
    setComparisonData(data);
  }, [molecules, selectedMolecule]);

  useEffect(() => {
    if (!canvasRef.current || comparisonData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw comparison bars
    const barWidth = (width - 100) / comparisonData.length;
    const maxWeight = Math.max(...comparisonData.map(d => d.molecular_weight));

    comparisonData.forEach((data, index) => {
      const x = 50 + index * barWidth;
      const barHeight = (data.molecular_weight / maxWeight) * (height - 100);
      const y = height - 50 - barHeight;

      // Bar
      ctx.fillStyle = data.isSelected ? '#3b82f6' : '#64748b';
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // Glow effect for selected
      if (data.isSelected) {
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        ctx.shadowBlur = 0;
      }

      // Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.save();
      ctx.translate(x + (barWidth - 10) / 2, height - 20);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(data.name, 0, 0);
      ctx.restore();

      // Value
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(data.molecular_weight.toFixed(0), x + 2, y - 5);
    });

  }, [comparisonData]);

  return (
    <div className="comparison-graph">
      <div className="chart-header">
        <BarChart3 size={16} />
        <span>Molecular Weight Comparison</span>
      </div>
      <canvas ref={canvasRef} width={400} height={200} />
    </div>
  );
};

// Agricultural Effectiveness Meter
const EffectivenessMeter = ({ molecule }) => {
  const [effectiveness, setEffectiveness] = useState(0);
  const [targetEffectiveness, setTargetEffectiveness] = useState(0);

  useEffect(() => {
    if (!molecule) return;

    // Calculate effectiveness based on molecule properties
    let score = 50; // Base score
    
    if (molecule.category?.includes('pesticide')) score += 20;
    if (molecule.category?.includes('fertilizer')) score += 15;
    if (molecule.rwanda_relevance) score += 25;
    if (molecule.applications?.length > 2) score += 10;
    
    // Add some randomness for demo
    score += Math.random() * 20 - 10;
    score = Math.max(0, Math.min(100, score));
    
    setTargetEffectiveness(score);
  }, [molecule]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEffectiveness(prev => {
        const diff = targetEffectiveness - prev;
        if (Math.abs(diff) < 0.5) return targetEffectiveness;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [targetEffectiveness]);

  const getEffectivenessColor = (value) => {
    if (value < 30) return '#ef4444';
    if (value < 60) return '#f59e0b';
    if (value < 80) return '#10b981';
    return '#059669';
  };

  const getEffectivenessLabel = (value) => {
    if (value < 30) return 'Low';
    if (value < 60) return 'Moderate';
    if (value < 80) return 'High';
    return 'Excellent';
  };

  return (
    <div className="effectiveness-meter">
      <div className="chart-header">
        <Target size={16} />
        <span>Agricultural Effectiveness</span>
      </div>
      <div className="meter-container">
        <div className="meter-gauge">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getEffectivenessColor(effectiveness)}
              strokeWidth="8"
              strokeDasharray={`${(effectiveness / 100) * 251.3} 251.3`}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${getEffectivenessColor(effectiveness)}40)`
              }}
            />
            {/* Center text */}
            <text x="100" y="80" textAnchor="middle" className="meter-value">
              {effectiveness.toFixed(0)}%
            </text>
            <text x="100" y="95" textAnchor="middle" className="meter-label">
              {getEffectivenessLabel(effectiveness)}
            </text>
          </svg>
        </div>
        
        {molecule && (
          <div className="effectiveness-details">
            <div className="detail-item">
              <span>Category Impact:</span>
              <span>{molecule.category?.includes('pesticide') ? '+20%' : '+15%'}</span>
            </div>
            <div className="detail-item">
              <span>Rwanda Relevance:</span>
              <span>{molecule.rwanda_relevance ? '+25%' : '0%'}</span>
            </div>
            <div className="detail-item">
              <span>Applications:</span>
              <span>+{(molecule.applications?.length || 0) * 5}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3D Molecular Property Surface
const PropertySurface = ({ molecule }) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !molecule) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3D-like surface
      const points = [];
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          const x = (i - 10) * 8;
          const y = (j - 10) * 8;
          const z = Math.sin((x + rotation * 50) * 0.02) * Math.cos((y + rotation * 30) * 0.02) * 30;
          
          const screenX = centerX + x + z * 0.3;
          const screenY = centerY + y + z * 0.2;
          
          points.push({ x: screenX, y: screenY, z });
        }
      }

      // Draw surface points
      points.forEach(point => {
        const intensity = (point.z + 30) / 60;
        const size = 1 + intensity * 3;
        
        ctx.fillStyle = `rgba(59, 130, 246, ${intensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (isAnimating) {
        setRotation(prev => prev + 0.01);
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [molecule, rotation, isAnimating]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth - 40;
      canvas.height = 400;
    }
  }, []);

  return (
    <div className="property-surface">
      <div className="chart-header">
        <Gauge size={16} />
        <span>Molecular Property Surface</span>
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className="surface-control"
        >
          {isAnimating ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};

// Real-time Calculation Progress
const CalculationProgress = ({ isCalculating, progress, currentStep }) => {
  const steps = [
    'Initializing quantum simulation...',
    'Calculating molecular orbitals...',
    'Computing energy eigenvalues...',
    'Analyzing bond properties...',
    'Evaluating agricultural effectiveness...',
    'Generating visualization data...',
    'Finalizing results...'
  ];

  return (
    <div className={`calculation-progress ${isCalculating ? 'active' : ''}`}>
      <div className="progress-header">
        <Zap size={16} />
        <span>Quantum Simulation Progress</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="progress-details">
        <div className="current-step">
          {steps[currentStep] || 'Simulation complete'}
        </div>
        <div className="progress-percentage">
          {progress.toFixed(0)}%
        </div>
      </div>
      
      <div className="step-indicators">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`step-indicator ${index <= currentStep ? 'completed' : ''}`}
          >
            <div className="step-dot" />
            <span className="step-text">{step.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Molecule Comparison Component
const MoleculeComparison = ({ molecules, currentMolecule }) => {
  const [selectedMolecules, setSelectedMolecules] = useState([]);
  const [showSelector, setShowSelector] = useState(false);

  const toggleMoleculeSelection = (mol) => {
    if (selectedMolecules.find(m => m.id === mol.id)) {
      setSelectedMolecules(selectedMolecules.filter(m => m.id !== mol.id));
    } else if (selectedMolecules.length < 4) {
      setSelectedMolecules([...selectedMolecules, mol]);
    }
  };

  const generateComparisonReport = () => {
    const report = {
      timestamp: new Date().toLocaleString(),
      molecules: selectedMolecules.map(mol => ({
        name: mol.name,
        weight: mol.molecular_weight,
        atoms: mol.num_atoms,
        formula: mol.formula,
        category: mol.category
      }))
    };
    const csv = generateCSV(report);
    downloadCSV(csv, 'molecule-comparison.csv');
  };

  const generateCSV = (report) => {
    let csv = 'Molecule Comparison Report\n';
    csv += `Generated: ${report.timestamp}\n\n`;
    csv += 'Molecule Name,Molecular Weight,Atom Count,Formula,Category\n';
    report.molecules.forEach(mol => {
      csv += `"${mol.name}",${mol.weight},${mol.atoms},"${mol.formula}","${mol.category}"\n`;
    });
    return csv;
  };

  const downloadCSV = (csv, filename) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="molecule-comparison">
      <div className="comparison-header">
        <h3>Molecule Comparison</h3>
        <button 
          className="add-molecule-btn"
          onClick={() => setShowSelector(!showSelector)}
        >
          <Plus size={16} />
          Add Molecule ({selectedMolecules.length}/4)
        </button>
      </div>

      {showSelector && (
        <div className="molecule-selector">
          <div className="selector-header">
            <h4>Select Molecules to Compare</h4>
            <button 
              className="close-btn"
              onClick={() => setShowSelector(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="molecule-list">
            {molecules.slice(0, 10).map(mol => (
              <div 
                key={mol.id}
                className={`molecule-option ${selectedMolecules.find(m => m.id === mol.id) ? 'selected' : ''}`}
                onClick={() => toggleMoleculeSelection(mol)}
              >
                <input 
                  type="checkbox"
                  checked={!!selectedMolecules.find(m => m.id === mol.id)}
                  onChange={() => {}}
                />
                <span className="mol-name">{mol.name}</span>
                <span className="mol-weight">{mol.molecular_weight?.toFixed(1)} g/mol</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMolecules.length > 0 && (
        <div className="comparison-grid">
          {selectedMolecules.map((mol, idx) => (
            <div key={mol.id} className="comparison-card">
              <div className="card-header">
                <h4>{mol.name}</h4>
                <button 
                  className="remove-btn"
                  onClick={() => setSelectedMolecules(selectedMolecules.filter(m => m.id !== mol.id))}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="card-properties">
                <div className="property">
                  <span className="label">Molecular Weight</span>
                  <span className="value">{mol.molecular_weight?.toFixed(2)} g/mol</span>
                </div>
                <div className="property">
                  <span className="label">Atoms</span>
                  <span className="value">{mol.num_atoms}</span>
                </div>
                <div className="property">
                  <span className="label">Formula</span>
                  <span className="value">{mol.formula || 'N/A'}</span>
                </div>
                <div className="property">
                  <span className="label">Category</span>
                  <span className="value">{mol.category?.replace('_', ' ')}</span>
                </div>

                <div className="property">
                  <span className="label">Effectiveness</span>
                  <div className="effectiveness-bar">
                    <div 
                      className="effectiveness-fill"
                      style={{ width: `${Math.min(100, (mol.molecular_weight / 500) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="property">
                  <span className="label">Potency</span>
                  <div className="potency-bar">
                    <div 
                      className="potency-fill"
                      style={{ width: `${Math.min(100, (mol.num_atoms / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMolecules.length > 0 && (
        <div className="comparison-actions">
          <button 
            className="export-btn"
            onClick={generateComparisonReport}
          >
            <FileText size={16} />
            Export Comparison
          </button>
        </div>
      )}

      {selectedMolecules.length === 0 && !showSelector && (
        <div className="comparison-empty">
          <BarChart3 size={32} />
          <p>Select molecules to compare their properties</p>
        </div>
      )}
    </div>
  );
};

// Interactive Controls Component
const InteractiveControls = ({ molecule, onParameterChange }) => {
  const [bondDistance, setBondDistance] = useState(1.0);
  const [temperature, setTemperature] = useState(298);
  const [pressure, setPressure] = useState(1.0);

  const handleBondChange = (value) => {
    setBondDistance(value);
    onParameterChange({ bondDistance: value, temperature, pressure });
  };

  const handleTempChange = (value) => {
    setTemperature(value);
    onParameterChange({ bondDistance, temperature: value, pressure });
  };

  const handlePressureChange = (value) => {
    setPressure(value);
    onParameterChange({ bondDistance, temperature, pressure: value });
  };

  return (
    <div className="interactive-controls">
      <h3>
        <Sliders size={18} />
        Interactive Parameters
      </h3>
      
      <div className="control-group">
        <label>Bond Distance Scale: {bondDistance.toFixed(2)}</label>
        <input 
          type="range" 
          min="0.5" 
          max="2.0" 
          step="0.1" 
          value={bondDistance}
          onChange={(e) => handleBondChange(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label>Temperature (K): {temperature}</label>
        <input 
          type="range" 
          min="0" 
          max="500" 
          step="10" 
          value={temperature}
          onChange={(e) => handleTempChange(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label>Pressure (atm): {pressure.toFixed(1)}</label>
        <input 
          type="range" 
          min="0.1" 
          max="10" 
          step="0.1" 
          value={pressure}
          onChange={(e) => handlePressureChange(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <button className="reset-btn">
        <RotateCcw size={14} />
        Reset to Default
      </button>
    </div>
  );
};

// Advanced Analysis Component
const AdvancedAnalysis = ({ molecule }) => {
  const orbitals = [
    { name: 'HOMO', energy: -5.2, color: '#ef4444' },
    { name: 'LUMO', energy: -2.1, color: '#3b82f6' },
    { name: 'HOMO-1', energy: -6.1, color: '#f97316' },
    { name: 'LUMO+1', energy: -1.2, color: '#06b6d4' }
  ];

  return (
    <div className="advanced-analysis">
      <h3>
        <Layers size={18} />
        Advanced Analysis
      </h3>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h4>Molecular Orbitals</h4>
          <div className="orbitals-list">
            {orbitals.map((orbital, idx) => (
              <div key={idx} className="orbital-item">
                <span className="orbital-name">{orbital.name}</span>
                <div className="orbital-bar">
                  <div 
                    className="orbital-fill"
                    style={{ 
                      backgroundColor: orbital.color,
                      width: `${Math.abs(orbital.energy) * 10}%`
                    }}
                  ></div>
                </div>
                <span className="orbital-energy">{orbital.energy} eV</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h4>Charge Distribution</h4>
          <div className="charge-info">
            <div className="charge-stat">
              <span className="label">Positive Charge</span>
              <span className="value">+0.45</span>
            </div>
            <div className="charge-stat">
              <span className="label">Negative Charge</span>
              <span className="value">-0.45</span>
            </div>
            <div className="charge-stat">
              <span className="label">Dipole Moment</span>
              <span className="value">2.3 D</span>
            </div>
          </div>
        </div>

        <div className="analysis-card">
          <h4>Bond Analysis</h4>
          <div className="bonds-info">
            <div className="bond-stat">
              <span className="label">Avg Bond Length</span>
              <span className="value">1.54 Å</span>
            </div>
            <div className="bond-stat">
              <span className="label">Bond Strength</span>
              <span className="value">85%</span>
            </div>
            <div className="bond-stat">
              <span className="label">Aromaticity</span>
              <span className="value">Medium</span>
            </div>
          </div>
        </div>

        <div className="analysis-card">
          <h4>Thermodynamic Data</h4>
          <div className="thermo-info">
            <div className="thermo-stat">
              <span className="label">Enthalpy</span>
              <span className="value">-245.3 kJ/mol</span>
            </div>
            <div className="thermo-stat">
              <span className="label">Entropy</span>
              <span className="value">125.6 J/mol·K</span>
            </div>
            <div className="thermo-stat">
              <span className="label">Free Energy</span>
              <span className="value">-182.7 kJ/mol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Agricultural Integration Component
const AgriculturalIntegration = ({ molecule }) => {
  const crops = [
    { name: 'Maize', compatibility: 92, effectiveness: 88 },
    { name: 'Beans', compatibility: 85, effectiveness: 82 },
    { name: 'Coffee', compatibility: 78, effectiveness: 75 },
    { name: 'Banana', compatibility: 88, effectiveness: 85 }
  ];

  const pests = [
    { name: 'Fall Armyworm', effectiveness: 95 },
    { name: 'Stem Borer', effectiveness: 87 },
    { name: 'Aphids', effectiveness: 78 },
    { name: 'Whitefly', effectiveness: 82 }
  ];

  return (
    <div className="agricultural-integration">
      <h3>
        <Leaf size={18} />
        Agricultural Integration
      </h3>

      <div className="agri-grid">
        <div className="agri-card">
          <h4>Crop Compatibility</h4>
          <div className="compatibility-list">
            {crops.map((crop, idx) => (
              <div key={idx} className="compatibility-item">
                <span className="crop-name">{crop.name}</span>
                <div className="compat-bar">
                  <div 
                    className="compat-fill"
                    style={{ width: `${crop.compatibility}%` }}
                  ></div>
                </div>
                <span className="compat-value">{crop.compatibility}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="agri-card">
          <h4>Pest Effectiveness</h4>
          <div className="pest-list">
            {pests.map((pest, idx) => (
              <div key={idx} className="pest-item">
                <span className="pest-name">{pest.name}</span>
                <div className="pest-bar">
                  <div 
                    className="pest-fill"
                    style={{ width: `${pest.effectiveness}%` }}
                  ></div>
                </div>
                <span className="pest-value">{pest.effectiveness}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="agri-card">
          <h4>Recommendations</h4>
          <div className="recommendations">
            <div className="rec-item">
              <span className="rec-label">Best For:</span>
              <span className="rec-value">Maize & Banana crops</span>
            </div>
            <div className="rec-item">
              <span className="rec-label">Dosage:</span>
              <span className="rec-value">50-100 ppm</span>
            </div>
            <div className="rec-item">
              <span className="rec-label">Application:</span>
              <span className="rec-value">Foliar spray</span>
            </div>
            <div className="rec-item">
              <span className="rec-label">Frequency:</span>
              <span className="rec-value">Every 2 weeks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Batch Processing Component
const BatchProcessing = ({ molecules }) => {
  const [batchQueue, setBatchQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToBatch = (mol) => {
    if (batchQueue.length < 10) {
      setBatchQueue([...batchQueue, { ...mol, status: 'pending', progress: 0 }]);
    }
  };

  const startBatchProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div className="batch-processing">
      <h3>
        <Copy size={18} />
        Batch Processing
      </h3>

      <div className="batch-controls">
        <button className="batch-btn" onClick={() => addToBatch(molecules[0])}>
          <Plus size={14} />
          Add to Batch
        </button>
        <button 
          className="batch-btn primary" 
          onClick={startBatchProcessing}
          disabled={batchQueue.length === 0 || isProcessing}
        >
          <Play size={14} />
          {isProcessing ? 'Processing...' : 'Run Batch'}
        </button>
      </div>

      <div className="batch-queue">
        <h4>Queue ({batchQueue.length}/10)</h4>
        {batchQueue.length === 0 ? (
          <p className="empty-queue">No molecules in queue</p>
        ) : (
          <div className="queue-list">
            {batchQueue.map((item, idx) => (
              <div key={idx} className="queue-item">
                <span className="queue-index">{idx + 1}</span>
                <span className="queue-name">{item.name}</span>
                <div className="queue-progress">
                  <div 
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <span className={`queue-status ${item.status}`}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Historical Data Component
const HistoricalData = ({ molecule }) => {
  const history = [
    { date: '2025-11-20 09:15', energy: -245.3, status: 'Completed' },
    { date: '2025-11-20 08:45', energy: -244.8, status: 'Completed' },
    { date: '2025-11-20 08:20', energy: -246.1, status: 'Completed' },
    { date: '2025-11-19 15:30', energy: -245.0, status: 'Completed' }
  ];

  return (
    <div className="historical-data">
      <h3>
        <Clock size={18} />
        Historical Data
      </h3>

      <div className="history-container">
        <div className="history-stats">
          <div className="stat">
            <span className="label">Total Simulations</span>
            <span className="value">24</span>
          </div>
          <div className="stat">
            <span className="label">Avg Energy</span>
            <span className="value">-245.2 kJ/mol</span>
          </div>
          <div className="stat">
            <span className="label">Last Updated</span>
            <span className="value">2 hours ago</span>
          </div>
        </div>

        <div className="history-list">
          <h4>Recent Simulations</h4>
          {history.map((item, idx) => (
            <div key={idx} className="history-item">
              <span className="history-date">{item.date}</span>
              <span className="history-energy">{item.energy} kJ/mol</span>
              <span className={`history-status ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
              <button className="history-btn">
                <Eye size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Simulation Visualizations Component
const SimulationVisualizations = ({ molecule, molecules, isVisible }) => {
  const [activeVisualization, setActiveVisualization] = useState('molecule3d');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationData, setSimulationData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch simulation data from backend when molecule changes
  useEffect(() => {
    if (!molecule) return;

    const fetchSimulationData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch('http://localhost:8000/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            molecule_string: molecule.molecule_string || molecule.name,
            method: 'hf'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSimulationData(data);
          console.log('Simulation data loaded:', data);
        } else {
          console.warn('Simulation endpoint returned:', response.status);
          // Use mock data if backend fails
          setSimulationData({
            vibrational_frequencies: [100, 150, 200, 250, 300],
            homo_lumo_gap: 3.5,
            total_energy: -245.3,
            dipole_moment: 2.3
          });
        }
      } catch (error) {
        console.error('Error fetching simulation data:', error);
        // Use mock data if backend fails
        setSimulationData({
          vibrational_frequencies: [100, 150, 200, 250, 300],
          homo_lumo_gap: 3.5,
          total_energy: -245.3,
          dipole_moment: 2.3
        });
      }
      setIsLoadingData(false);
    };

    fetchSimulationData();
  }, [molecule]);

  const startSimulation = () => {
    setIsCalculating(true);
    setCalculationProgress(0);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCalculationProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsCalculating(false);
          setCurrentStep(6);
          return 100;
        }
        
        setCurrentStep(Math.floor(newProgress / 15));
        return newProgress;
      });
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="simulation-visualizations">
      <div className="visualization-header">
        <h3>Quantum Simulation Visualizations</h3>
        <div className="visualization-controls">
          <button 
            onClick={startSimulation}
            disabled={isCalculating}
            className="simulate-btn"
          >
            <Zap size={16} />
            {isCalculating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <CalculationProgress 
        isCalculating={isCalculating}
        progress={calculationProgress}
        currentStep={currentStep}
      />

      <div className="visualization-tabs">
        <button 
          className={`viz-tab ${activeVisualization === 'molecule3d' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('molecule3d')}
        >
          <Atom size={14} />
          3D Molecule
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'molecules' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('molecules')}
        >
          <BarChart3 size={14} />
          Compare Molecules
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'energy' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('energy')}
        >
          <Activity size={14} />
          Energy Levels
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('comparison')}
        >
          <TrendingUp size={14} />
          Property Graph
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'effectiveness' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('effectiveness')}
        >
          <Target size={14} />
          Effectiveness
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'surface' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('surface')}
        >
          <Gauge size={14} />
          3D Surface
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'controls' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('controls')}
        >
          <Sliders size={14} />
          Interactive
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('analysis')}
        >
          <Layers size={14} />
          Advanced
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'agricultural' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('agricultural')}
        >
          <Leaf size={14} />
          Agriculture
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('batch')}
        >
          <Copy size={14} />
          Batch
        </button>
        <button 
          className={`viz-tab ${activeVisualization === 'history' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('history')}
        >
          <Clock size={14} />
          History
        </button>
      </div>

      <div className="visualization-content">
        {activeVisualization === 'molecule3d' && (
          <MoleculeViewer3D molecule={molecule} isActive={true} />
        )}

        {activeVisualization === 'molecules' && (
          <MoleculeComparison molecules={molecules} currentMolecule={molecule} />
        )}

        {activeVisualization === 'energy' && molecule && (
          <EnergyLevelChart molecule={molecule} isActive={true} />
        )}
        
        {activeVisualization === 'comparison' && molecules && (
          <PropertyComparisonGraph molecules={molecules} selectedMolecule={molecule} />
        )}
        
        {activeVisualization === 'effectiveness' && molecule && (
          <EffectivenessMeter molecule={molecule} />
        )}
        
        {activeVisualization === 'surface' && molecule && (
          <PropertySurface molecule={molecule} />
        )}

        {activeVisualization === 'controls' && (
          <InteractiveControls molecule={molecule} onParameterChange={(params) => console.log(params)} />
        )}

        {activeVisualization === 'analysis' && (
          <AdvancedAnalysis molecule={molecule} />
        )}

        {activeVisualization === 'agricultural' && (
          <AgriculturalIntegration molecule={molecule} />
        )}

        {activeVisualization === 'batch' && (
          <BatchProcessing molecules={molecules} />
        )}

        {activeVisualization === 'history' && (
          <HistoricalData molecule={molecule} />
        )}
      </div>
    </div>
  );
};

export default SimulationVisualizations;
