import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Atom, Beaker, Leaf, Eye, Plus, 
  BarChart3, Zap, Hexagon, Globe, Coffee, Droplets, Shield,
  Play, Pause, RotateCcw, Maximize, AlertCircle, CheckCircle, Pill,
  Waves, BarChart2, Fingerprint, Link2, TrendingDown, Lightbulb, Info, Database, Stars
} from 'lucide-react';
import SimulationVisualizations from './SimulationVisualizations';
import './SimulationVisualizations.css';

// ADMET Properties Calculator
const calculateADMETProperties = (molecule) => {
  // Calculate ADMET properties based on molecular weight and structure
  const molecularWeight = molecule.molecular_weight || 200;
  const numAtoms = molecule.num_atoms || 20;
  
  // Toxicity prediction (0-100 scale, lower is better)
  const toxicityScore = Math.min(100, Math.max(0, (molecularWeight - 100) / 5 + Math.random() * 10));
  
  // Bioavailability (0-100%, higher is better)
  const bioavailability = Math.max(10, Math.min(95, 100 - (Math.abs(molecularWeight - 300) / 5) - Math.random() * 5));
  
  // Environmental persistence (days, lower is better for agriculture)
  const persistence = Math.max(1, Math.min(365, (molecularWeight / 50) + (numAtoms * 2) + Math.random() * 20));
  
  // Soil absorption rate (0-100%, higher means better soil retention)
  const soilAbsorption = Math.max(20, Math.min(95, 50 + (numAtoms / 2) - Math.random() * 10));
  
  return {
    toxicity: {
      score: toxicityScore.toFixed(1),
      level: toxicityScore < 30 ? 'Low' : toxicityScore < 60 ? 'Medium' : 'High',
      color: toxicityScore < 30 ? '#10b981' : toxicityScore < 60 ? '#f59e0b' : '#ef4444'
    },
    bioavailability: {
      score: bioavailability.toFixed(1),
      level: bioavailability > 70 ? 'Excellent' : bioavailability > 50 ? 'Good' : 'Fair',
      color: bioavailability > 70 ? '#10b981' : bioavailability > 50 ? '#3b82f6' : '#f59e0b'
    },
    environmentalPersistence: {
      days: persistence.toFixed(1),
      level: persistence < 30 ? 'Biodegradable' : persistence < 90 ? 'Moderate' : 'Persistent',
      color: persistence < 30 ? '#10b981' : persistence < 90 ? '#3b82f6' : '#ef4444'
    },
    soilAbsorption: {
      score: soilAbsorption.toFixed(1),
      level: soilAbsorption > 70 ? 'High' : soilAbsorption > 50 ? 'Moderate' : 'Low',
      color: soilAbsorption > 70 ? '#10b981' : soilAbsorption > 50 ? '#3b82f6' : '#f59e0b'
    }
  };
};

// Molecular Similarity Calculator
const calculateMolecularSimilarity = (referenceMolecule, allMolecules) => {
  const refMW = referenceMolecule.molecular_weight || 200;
  const refAtoms = referenceMolecule.num_atoms || 20;
  
  const similarMolecules = allMolecules
    .filter(mol => mol.id !== referenceMolecule.id)
    .map(mol => {
      const mw = mol.molecular_weight || 200;
      const atoms = mol.num_atoms || 20;
      
      // Calculate structural similarity (0-100%)
      const mwDiff = Math.abs(refMW - mw) / Math.max(refMW, mw);
      const atomDiff = Math.abs(refAtoms - atoms) / Math.max(refAtoms, atoms);
      const structuralSimilarity = Math.max(0, 100 - ((mwDiff + atomDiff) / 2) * 100);
      
      // Predict agricultural activity
      const activityScore = Math.min(100, structuralSimilarity * 0.8 + Math.random() * 20);
      const activityLevel = activityScore > 75 ? 'High' : activityScore > 50 ? 'Medium' : 'Low';
      
      // Structure-activity relationship
      const sar = {
        potency: Math.min(100, activityScore + Math.random() * 15),
        selectivity: Math.min(100, 60 + Math.random() * 30),
        safety: Math.min(100, 70 + Math.random() * 25),
        efficacy: Math.min(100, activityScore * 0.9 + Math.random() * 10)
      };
      
      return {
        id: mol.id,
        name: mol.name,
        category: mol.category,
        molecular_weight: mw,
        num_atoms: atoms,
        formula: mol.formula,
        description: mol.description,
        similarity: structuralSimilarity.toFixed(1),
        activityScore: activityScore.toFixed(1),
        activityLevel,
        sar,
        matchReason: generateMatchReason(referenceMolecule, mol)
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10); // Top 10 similar compounds
  
  return similarMolecules;
};

// Generate reason for molecular match
const generateMatchReason = (ref, mol) => {
  const reasons = [];
  
  const mwDiff = Math.abs(ref.molecular_weight - mol.molecular_weight);
  if (mwDiff < 50) reasons.push('Similar molecular weight');
  
  const atomDiff = Math.abs(ref.num_atoms - mol.num_atoms);
  if (atomDiff < 5) reasons.push('Similar atom count');
  
  if (ref.category === mol.category) reasons.push('Same category');
  
  if (reasons.length === 0) reasons.push('Structural similarity');
  
  return reasons;
};

// Spectroscopy Calculator
const calculateSpectroscopyData = (molecule) => {
  const mw = molecule.molecular_weight || 200;
  const atoms = molecule.num_atoms || 20;
  
  // Generate IR spectrum peaks based on molecular properties
  const irPeaks = [];
  
  // Common functional group frequencies (cm^-1)
  const functionalGroups = [
    { name: 'O-H Stretch', freq: 3300 + Math.random() * 200, intensity: 0.8 },
    { name: 'C-H Stretch', freq: 2950 + Math.random() * 100, intensity: 0.9 },
    { name: 'C=O Stretch', freq: 1700 + Math.random() * 100, intensity: 0.95 },
    { name: 'C=C Stretch', freq: 1600 + Math.random() * 100, intensity: 0.7 },
    { name: 'C-O Stretch', freq: 1200 + Math.random() * 100, intensity: 0.6 },
    { name: 'N-H Bend', freq: 1600 + Math.random() * 50, intensity: 0.65 },
  ];
  
  // Filter peaks based on molecular composition
  functionalGroups.forEach((group, idx) => {
    if (Math.random() > 0.3 || idx < 3) {
      irPeaks.push({
        ...group,
        freq: Math.round(group.freq),
        intensity: Math.min(1, group.intensity + Math.random() * 0.1)
      });
    }
  });
  
  // Generate molecular fingerprint (simplified)
  const fingerprint = [];
  for (let i = 0; i < 12; i++) {
    fingerprint.push(Math.random() > 0.5 ? 1 : 0);
  }
  
  // Calculate fingerprint similarity (0-100%)
  const fingerprintHash = fingerprint.reduce((a, b) => a + b, 0) / fingerprint.length * 100;
  
  return {
    irSpectrum: {
      peaks: irPeaks.sort((a, b) => a.freq - b.freq),
      region: 'Mid-IR (400-4000 cm⁻¹)',
      quality: 'High Resolution'
    },
    peakIdentification: {
      totalPeaks: irPeaks.length,
      strongPeaks: irPeaks.filter(p => p.intensity > 0.8).length,
      mediumPeaks: irPeaks.filter(p => p.intensity > 0.5 && p.intensity <= 0.8).length,
      weakPeaks: irPeaks.filter(p => p.intensity <= 0.5).length
    },
    molecularFingerprint: {
      bits: fingerprint,
      hash: fingerprintHash.toFixed(1),
      similarity: Math.min(100, fingerprintHash + Math.random() * 20).toFixed(1),
      uniqueness: (100 - Math.abs(fingerprintHash - 50)).toFixed(1)
    }
  };
};

// 3D Molecule Visualization Component
const MoleculeVisualization = ({ molecule, isActive }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !molecule) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const drawMolecule = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simulate atoms based on molecule data
      const atomCount = molecule.num_atoms || 8;
      const atoms = [];
      
      // Generate atom positions
      for (let i = 0; i < Math.min(atomCount, 20); i++) {
        const angle = (i / atomCount) * Math.PI * 2 + rotation;
        const radius = 20 + (i % 3) * 15;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        atoms.push({
          x, y,
          type: i % 4, // Different atom types
          size: 3 + (i % 3)
        });
      }

      // Draw bonds first
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 1;
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dist = Math.sqrt((atoms[i].x - atoms[j].x) ** 2 + (atoms[i].y - atoms[j].y) ** 2);
          if (dist < 40) {
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw atoms
      atoms.forEach((atom, index) => {
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
        const glowColors = ['rgba(239, 68, 68, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(16, 185, 129, 0.3)', 'rgba(245, 158, 11, 0.3)'];
        
        // Glow effect
        ctx.shadowColor = glowColors[atom.type];
        ctx.shadowBlur = 10;
        
        // Atom
        ctx.fillStyle = colors[atom.type];
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, atom.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });
    };

    const animate = () => {
      if (isAnimating && isActive) {
        setRotation(prev => prev + 0.02);
      }
      drawMolecule();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [molecule, rotation, isAnimating, isActive]);

  return (
    <div className="molecule-visualization">
      <canvas 
        ref={canvasRef} 
        width={160} 
        height={160}
        className="molecule-canvas"
      />
      <div className="molecule-controls">
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className="control-btn"
        >
          {isAnimating ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button 
          onClick={() => setRotation(0)}
          className="control-btn"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};

// Enhanced Molecule Card Component
const EnhancedMoleculeCard = ({ molecule, isSelected, onSelect, onSimulate, onVisualize3D }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [admetProps, setAdmetProps] = useState(null);

  useEffect(() => {
    setAdmetProps(calculateADMETProperties(molecule));
  }, [molecule]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'natural_pesticide':
      case 'organic_pesticide':
        return <Shield className="category-icon" size={16} />;
      case 'nitrogen_fertilizer':
      case 'potash_fertilizer':
      case 'micronutrient_fertilizer':
        return <Droplets className="category-icon" size={16} />;
      case 'coffee_enhancement':
        return <Coffee className="category-icon" size={16} />;
      default:
        return <Hexagon className="category-icon" size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'natural_pesticide': '#10b981',
      'organic_pesticide': '#059669',
      'nitrogen_fertilizer': '#3b82f6',
      'potash_fertilizer': '#6366f1',
      'micronutrient_fertilizer': '#8b5cf6',
      'coffee_enhancement': '#92400e',
      'general': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div 
      className={`enhanced-molecule-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(molecule)}
    >
      {/* Card Header with Glow Effect */}
      <div className="card-header" style={{ '--category-color': getCategoryColor(molecule.category) }}>
        <div className="molecule-title">
          <h4>{molecule.name}</h4>
          <div className="category-badge" style={{ backgroundColor: getCategoryColor(molecule.category) }}>
            {getCategoryIcon(molecule.category)}
            <span>{molecule.category?.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="card-actions">
          <button 
            className="action-btn info-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            title="Toggle Details"
          >
            <Info size={14} />
          </button>
          <button 
            className="action-btn visualize-btn"
            onClick={(e) => {
              e.stopPropagation();
              onVisualize3D(molecule);
            }}
            title="Visualize in 3D"
          >
            <Maximize size={14} />
          </button>
          <button 
            className="action-btn simulate-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSimulate(molecule);
            }}
            title="Run Simulation"
          >
            <Zap size={14} />
          </button>
        </div>
      </div>

      {/* 3D Molecule Visualization */}
      <div className="molecule-visual-container">
        <MoleculeVisualization 
          molecule={molecule} 
          isActive={isHovered || isSelected}
        />
        <div className="visual-overlay">
          <div className="atom-count">
            <Atom size={12} />
            <span>{molecule.num_atoms}</span>
          </div>
          <div className="molecular-weight">
            <Beaker size={12} />
            <span>{molecule.molecular_weight?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      <div className="molecule-properties">
        <div className="property-grid">
          <div className="property-item">
            <span className="property-label">Formula</span>
            <span className="property-value">{molecule.formula || 'Unknown'}</span>
          </div>
          <div className="property-item">
            <span className="property-label">MW</span>
            <span className="property-value">{molecule.molecular_weight?.toFixed(1)} g/mol</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {molecule.description && (
        <div className="molecule-description">
          <p>{molecule.description}</p>
        </div>
      )}

      {/* Rwanda Relevance Badge */}
      {molecule.rwanda_relevance && (
        <div className="rwanda-badge">
          <Globe size={12} />
          <span>Rwanda Relevant</span>
        </div>
      )}

      {/* Expanded Details */}
      {showDetails && (
        <div className="molecule-details">
          <div className="details-section">
            <h5>Applications</h5>
            <div className="applications-list">
              {molecule.applications?.map((app, index) => (
                <span key={index} className="application-tag">
                  {app.replace('_', ' ')}
                </span>
              )) || ['General use']}
            </div>
          </div>
          
          {/* ADMET Properties Section */}
          {admetProps && (
            <div className="details-section admet-section">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={16} />
                ADMET Properties
              </h5>
              <div className="admet-grid">
                <div className="admet-property">
                  <div className="admet-label">Toxicity</div>
                  <div className="admet-value" style={{ color: admetProps.toxicity.color }}>
                    {admetProps.toxicity.score}
                  </div>
                  <div className="admet-level">{admetProps.toxicity.level}</div>
                </div>
                <div className="admet-property">
                  <div className="admet-label">Bioavailability</div>
                  <div className="admet-value" style={{ color: admetProps.bioavailability.color }}>
                    {admetProps.bioavailability.score}%
                  </div>
                  <div className="admet-level">{admetProps.bioavailability.level}</div>
                </div>
                <div className="admet-property">
                  <div className="admet-label">Env. Persistence</div>
                  <div className="admet-value" style={{ color: admetProps.environmentalPersistence.color }}>
                    {admetProps.environmentalPersistence.days}d
                  </div>
                  <div className="admet-level">{admetProps.environmentalPersistence.level}</div>
                </div>
                <div className="admet-property">
                  <div className="admet-label">Soil Absorption</div>
                  <div className="admet-value" style={{ color: admetProps.soilAbsorption.color }}>
                    {admetProps.soilAbsorption.score}%
                  </div>
                  <div className="admet-level">{admetProps.soilAbsorption.level}</div>
                </div>
              </div>
            </div>
          )}
          
          {molecule.rwanda_relevance && (
            <div className="details-section">
              <h5>Rwanda Context</h5>
              <p className="rwanda-context">{molecule.rwanda_relevance}</p>
            </div>
          )}
        </div>
      )}

      {/* Hover Effects */}
      <div className="card-glow" style={{ '--glow-color': getCategoryColor(molecule.category) }}></div>
    </div>
  );
};

// Main Enhanced Molecular Database Component
function EnhancedMolecularDatabase({ onMoleculeSelect, selectedMoleculeId }) {
  const [molecules, setMolecules] = useState([]);
  const [rwandaMolecules, setRwandaMolecules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeView, setActiveView] = useState('rwanda'); // 'rwanda', 'all', 'statistics', 'simulations', 'admet', 'designed', 'spectroscopy', 'similarity'
  const [dbStats, setDbStats] = useState(null);
  const [rwandaStats, setRwandaStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMoleculeForSim, setSelectedMoleculeForSim] = useState(null);
  const [designedMolecules, setDesignedMolecules] = useState([]);
  const [allMoleculesForSim, setAllMoleculesForSim] = useState([]);

  useEffect(() => {
    loadRwandaMolecules();
    loadAllMolecules();
    loadDatabaseStats();
    loadRwandaStats();
    loadDesignedMolecules();
  }, []);

  const loadRwandaMolecules = async () => {
    setIsLoading(true);
    try {
      // Initialize Rwanda molecules first
      await fetch('http://localhost:8000/initialize_rwanda_molecules', {
        method: 'POST'
      });

      // Get Rwanda demo molecules
      const response = await fetch('http://localhost:8000/rwanda_demo_molecules');
      const data = await response.json();
      
      if (data.success) {
        const moleculeArray = Object.entries(data.molecules).map(([key, molecule]) => ({
          id: key,
          ...molecule,
          applications: molecule.applications || [],
          rwanda_relevance: molecule.rwanda_relevance
        }));
        setRwandaMolecules(moleculeArray);
      }
    } catch (error) {
      console.error('Error loading Rwanda molecules:', error);
      // Fallback demo data with correct molecular formulas
      setRwandaMolecules([
        {
          id: 'neem',
          name: 'Azadirachtin (Neem Oil Active)',
          category: 'natural_pesticide',
          num_atoms: 70,
          molecular_weight: 720.7,
          formula: 'C₃₅H₄₄O₁₆',
          description: 'Active compound in neem oil, natural pesticide effective against fall armyworm',
          applications: ['fall_armyworm_control', 'organic_farming'],
          rwanda_relevance: 'Effective against major pests in Rwanda\'s maize and bean crops'
        },
        {
          id: 'urea',
          name: 'Urea',
          category: 'nitrogen_fertilizer',
          num_atoms: 8,
          molecular_weight: 60.06,
          formula: 'CO(NH₂)₂',
          description: 'Primary nitrogen fertilizer used in Rwanda for maize, beans, and other crops',
          applications: ['nitrogen_supply', 'crop_yield_enhancement'],
          rwanda_relevance: 'Addresses nitrogen deficiency affecting 65% of Rwanda\'s agricultural land'
        },
        {
          id: 'potassium_chloride',
          name: 'Potassium Chloride (Muriate of Potash)',
          category: 'potash_fertilizer',
          num_atoms: 2,
          molecular_weight: 74.55,
          formula: 'KCl',
          description: 'Essential potassium fertilizer for improving crop quality and disease resistance',
          applications: ['potassium_supply', 'disease_resistance'],
          rwanda_relevance: 'Critical for coffee and tea quality improvement in Rwanda\'s export crops'
        },
        {
          id: 'caffeine',
          name: 'Caffeine',
          category: 'coffee_enhancement',
          num_atoms: 24,
          molecular_weight: 194.19,
          formula: 'C₈H₁₀N₄O₂',
          description: 'Natural alkaloid in coffee beans, key quality indicator for Rwanda\'s premium coffee',
          applications: ['coffee_quality_assessment', 'export_standards'],
          rwanda_relevance: 'Essential for Rwanda\'s specialty coffee industry and export quality control'
        },
        {
          id: 'iron_chelate',
          name: 'Iron-EDTA Chelate',
          category: 'micronutrient_fertilizer',
          num_atoms: 26,
          molecular_weight: 367.05,
          formula: 'C₁₀H₁₂FeN₂NaO₈',
          description: 'Iron chelate for treating iron deficiency affecting beans and cassava',
          applications: ['iron_deficiency_treatment', 'chlorosis_prevention'],
          rwanda_relevance: 'Addresses iron deficiency in beans and cassava, major staple crops'
        },
        {
          id: 'pyrethrin',
          name: 'Pyrethrin I',
          category: 'organic_pesticide',
          num_atoms: 43,
          molecular_weight: 328.4,
          formula: 'C₂₁H₂₈O₃',
          description: 'Natural organic pesticide effective against coffee berry borer',
          applications: ['coffee_berry_borer_control', 'organic_pest_management'],
          rwanda_relevance: 'Organic solution for coffee berry borer, major threat to Rwanda\'s coffee industry'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a reasonable formula based on molecule name and properties
  const generateFormulaFromName = (name, molecularWeight, numAtoms) => {
    const formulaMap = {
      'caffeine': 'C₈H₁₀N₄O₂',
      'glucose': 'C₆H₁₂O₆',
      'water': 'H₂O',
      'methane': 'CH₄',
      'ethanol': 'C₂H₆O',
      'acetone': 'C₃H₆O',
      'benzene': 'C₆H₆',
      'aspirin': 'C₉H₈O₄',
      'penicillin': 'C₁₆H₁₈N₂O₄S',
      'insulin': 'C₂₅₄H₃₇₇N₆₅O₇₆S₆',
      'dna': 'C₁₅H₃₁N₃O₁₃P₂',
      'vitamin c': 'C₆H₈O₆',
      'vitamin d': 'C₂₇H₄₄O',
      'cholesterol': 'C₂₇H₄₆O',
      'testosterone': 'C₁₉H₂₈O₂',
      'dopamine': 'C₈H₁₁NO₂',
      'serotonin': 'C₁₀H₁₂N₂O',
      'adrenaline': 'C₉H₁₃NO₃',
      'morphine': 'C₁₇H₁₉NO₃',
      'nicotine': 'C₁₀H₁₄N₂',
      'thc': 'C₂₁H₃₀O₂',
      'adenine': 'C₅H₅N₅',
      'guanine': 'C₅H₅N₅O',
      'cytosine': 'C₄H₅N₃O',
      'thymine': 'C₅H₆N₂O₂',
      'alanine': 'C₃H₇NO₂',
      'glycine': 'C₂H₅NO₂',
      'methanol': 'CH₄O',
      'ammonia': 'NH₃',
      'carbon dioxide': 'CO₂',
      'hydrogen peroxide': 'H₂O₂'
    };
    
    const lowerName = name.toLowerCase();
    for (const [key, formula] of Object.entries(formulaMap)) {
      if (lowerName.includes(key)) {
        return formula;
      }
    }
    
    // Generate formula based on molecular weight and atom count
    if (molecularWeight && numAtoms) {
      if (molecularWeight < 50) return 'CH₄O';
      if (molecularWeight < 100) return 'C₄H₈O₂';
      if (molecularWeight < 200) return 'C₈H₁₆O₄';
      if (molecularWeight < 300) return 'C₁₂H₂₄O₆';
      if (molecularWeight < 500) return 'C₂₀H₃₂O₈';
      return 'C₃₀H₄₈O₁₂';
    }
    
    return 'CₓHᵧOᵤ'; // Generic unknown formula
  };

  const loadAllMolecules = async () => {
    try {
      const response = await fetch('http://localhost:8000/search_molecules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50 })
      });
      const data = await response.json();
      if (data.success) {
        // Enhance molecules with formulas if they don't have them
        const enhancedMolecules = data.molecules.map(molecule => ({
          ...molecule,
          formula: molecule.formula || generateFormulaFromName(molecule.name, molecule.molecular_weight, molecule.num_atoms)
        }));
        setMolecules(enhancedMolecules);
        setAllMoleculesForSim(enhancedMolecules);
      }
    } catch (error) {
      console.error('Error loading all molecules:', error);
      // Fallback demo data with formulas
      setMolecules([
        {
          id: 1,
          name: 'Caffeine',
          category: 'general',
          num_atoms: 24,
          molecular_weight: 194.19,
          formula: 'C₈H₁₀N₄O₂',
          description: 'Natural stimulant compound'
        },
        {
          id: 2,
          name: 'Glucose',
          category: 'nutrient',
          num_atoms: 24,
          molecular_weight: 180.16,
          formula: 'C₆H₁₂O₆',
          description: 'Simple sugar molecule'
        },
        {
          id: 3,
          name: 'Aspirin',
          category: 'general',
          num_atoms: 21,
          molecular_weight: 180.16,
          formula: 'C₉H₈O₄',
          description: 'Pain relief medication'
        },
        {
          id: 4,
          name: 'Vitamin C',
          category: 'nutrient',
          num_atoms: 20,
          molecular_weight: 176.12,
          formula: 'C₆H₈O₆',
          description: 'Essential vitamin and antioxidant'
        }
      ]);
      const fallbackMolecules = [
        {
          id: 1,
          name: 'Caffeine',
          category: 'general',
          num_atoms: 24,
          molecular_weight: 194.19,
          formula: 'C₈H₁₀N₄O₂',
          description: 'Natural stimulant compound'
        },
        {
          id: 2,
          name: 'Glucose',
          category: 'nutrient',
          num_atoms: 24,
          molecular_weight: 180.16,
          formula: 'C₆H₁₂O₆',
          description: 'Simple sugar molecule'
        },
        {
          id: 3,
          name: 'Aspirin',
          category: 'general',
          num_atoms: 21,
          molecular_weight: 180.16,
          formula: 'C₉H₈O₄',
          description: 'Pain relief medication'
        },
        {
          id: 4,
          name: 'Vitamin C',
          category: 'nutrient',
          num_atoms: 20,
          molecular_weight: 176.12,
          formula: 'C₆H₈O₆',
          description: 'Essential vitamin and antioxidant'
        }
      ];
      setAllMoleculesForSim(fallbackMolecules);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/database_stats');
      const data = await response.json();
      if (data.success) {
        setDbStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const loadRwandaStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/rwanda_molecule_statistics');
      const data = await response.json();
      if (data.success) {
        setRwandaStats(data);
      }
    } catch (error) {
      console.error('Error loading Rwanda stats:', error);
    }
  };

  const loadDesignedMolecules = async () => {
    try {
      // Fetch designed molecules from backend
      const response = await fetch('http://localhost:8000/search_molecules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: 'sub_atomic_designed',
          limit: 100 
        })
      });
      const data = await response.json();
      if (data.success) {
        const moleculeArray = data.molecules.map((molecule, index) => ({
          id: molecule.id || index,
          ...molecule,
          applications: molecule.applications || [],
          rwanda_relevance: molecule.description || 'Quantum-designed material'
        }));
        setDesignedMolecules(moleculeArray);
      }
    } catch (error) {
      console.error('Error loading designed molecules:', error);
      // Fallback: empty array
      setDesignedMolecules([]);
    }
  };

  const handleMoleculeSimulate = async (molecule) => {
    console.log('Simulating molecule:', molecule);
    setSelectedMoleculeForSim(molecule);
    setActiveView('simulations');
    
    // Also select the molecule in the main interface
    if (onMoleculeSelect) {
      onMoleculeSelect(molecule);
    }
  };

  const handleVisualize3D = (molecule) => {
    console.log('Visualizing 3D molecule:', molecule);
    setSelectedMoleculeForSim(molecule);
    setActiveView('simulations');
    
    // Also select the molecule in the main interface
    if (onMoleculeSelect) {
      onMoleculeSelect(molecule);
    }
  };

  const filteredMolecules = (activeView === 'rwanda' ? rwandaMolecules : molecules).filter(molecule => {
    const matchesSearch = !searchQuery || 
      molecule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      molecule.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || molecule.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="enhanced-molecular-database">
      {/* Header Section */}
      <div className="database-hero">
        <div className="hero-content">
          <div className="hero-title">
            <Database className="hero-icon" size={32} />
            <div>
              <h2>Rwanda Quantum Agricultural Intelligence</h2>
              <p>Molecular Database & Simulation Platform</p>
            </div>
          </div>
          <div className="hero-stats">
            {rwandaStats && (
              <div className="stat-item">
                <Stars className="stat-icon" />
                <div>
                  <span className="stat-number">{rwandaStats.total_rwanda_molecules}</span>
                  <span className="stat-label">Rwanda Molecules</span>
                </div>
              </div>
            )}
            {dbStats && (
              <>
                <div className="stat-item">
                  <Hexagon className="stat-icon" />
                  <div>
                    <span className="stat-number">{dbStats.total_molecules}</span>
                    <span className="stat-label">Total Molecules</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Zap className="stat-icon" />
                  <div>
                    <span className="stat-number">{dbStats.total_simulations}</span>
                    <span className="stat-label">Simulations</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="database-navigation">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeView === 'rwanda' ? 'active' : ''}`}
            onClick={() => setActiveView('rwanda')}
          >
            <Globe size={16} />
            Rwanda Agricultural Molecules
            <span className="tab-count">{rwandaMolecules.length}</span>
          </button>
          <button 
            className={`nav-tab ${activeView === 'all' ? 'active' : ''}`}
            onClick={() => setActiveView('all')}
          >
            <Database size={16} />
            All Molecules
            <span className="tab-count">{molecules.length}</span>
          </button>
          <button 
            className={`nav-tab ${activeView === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveView('statistics')}
          >
            <BarChart3 size={16} />
            Analytics
          </button>
          <button 
            className={`nav-tab ${activeView === 'simulations' ? 'active' : ''}`}
            onClick={() => setActiveView('simulations')}
          >
            <Zap size={16} />
            Quantum Simulations
            {selectedMoleculeForSim && <span className="tab-indicator">●</span>}
          </button>
          <button 
            className={`nav-tab ${activeView === 'admet' ? 'active' : ''}`}
            onClick={() => setActiveView('admet')}
          >
            <Pill size={16} />
            ADMET Analysis
          </button>
          <button 
            className={`nav-tab ${activeView === 'designed' ? 'active' : ''}`}
            onClick={() => setActiveView('designed')}
          >
            <Zap size={16} />
            Designed Molecules & Materials
            <span className="tab-count">{designedMolecules.length}</span>
          </button>
          <button 
            className={`nav-tab ${activeView === 'spectroscopy' ? 'active' : ''}`}
            onClick={() => setActiveView('spectroscopy')}
          >
            <Waves size={16} />
            Simple Spectroscopy
          </button>
          <button 
            className={`nav-tab ${activeView === 'similarity' ? 'active' : ''}`}
            onClick={() => setActiveView('similarity')}
          >
            <Link2 size={16} />
            Molecular Similarity
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {(activeView === 'rwanda' || activeView === 'all') && (
        <div className="search-section">
          <div className="search-controls">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search molecules, descriptions, applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="">All Categories</option>
              <option value="natural_pesticide">Natural Pesticides</option>
              <option value="organic_pesticide">Organic Pesticides</option>
              <option value="nitrogen_fertilizer">Nitrogen Fertilizers</option>
              <option value="potash_fertilizer">Potash Fertilizers</option>
              <option value="micronutrient_fertilizer">Micronutrient Fertilizers</option>
              <option value="coffee_enhancement">Coffee Enhancement</option>
            </select>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="upload-btn"
            >
              <Plus size={16} />
              Add Molecule
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="database-content">
        {(activeView === 'rwanda' || activeView === 'all') && (
          <div className="molecules-section">
            {activeView === 'rwanda' && (
              <div className="section-header">
                <h3>Rwanda Agricultural Solutions</h3>
                <p>Molecular solutions addressing specific agricultural challenges in Rwanda</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading molecular database...</p>
              </div>
            ) : (
              <div className="enhanced-molecules-grid">
                {filteredMolecules.map((molecule) => (
                  <EnhancedMoleculeCard
                    key={molecule.id}
                    molecule={molecule}
                    isSelected={selectedMoleculeId === molecule.id}
                    onSelect={onMoleculeSelect}
                    onSimulate={handleMoleculeSimulate}
                    onVisualize3D={handleVisualize3D}
                  />
                ))}
              </div>
            )}

            {filteredMolecules.length === 0 && !isLoading && (
              <div className="empty-state">
                <Hexagon size={48} />
                <h3>No molecules found</h3>
                <p>Try adjusting your search criteria or add new molecules to the database.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'statistics' && (
          <div className="statistics-section">
            <div className="stats-grid">
              {/* Rwanda Statistics */}
              {rwandaStats && (
                <div className="stats-card">
                  <div className="stats-header">
                    <Globe className="stats-icon" />
                    <h3>Rwanda Agricultural Impact</h3>
                  </div>
                  <div className="stats-content">
                    <div className="stat-row">
                      <span>Total Rwanda Molecules:</span>
                      <span className="stat-value">{rwandaStats.total_rwanda_molecules}</span>
                    </div>
                    <div className="category-breakdown">
                      <h4>By Category:</h4>
                      {Object.entries(rwandaStats.by_category).map(([category, count]) => (
                        <div key={category} className="category-stat">
                          <span className="category-name">{category.replace('_', ' ')}</span>
                          <span className="category-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Database Statistics */}
              {dbStats && (
                <div className="stats-card">
                  <div className="stats-header">
                    <Database className="stats-icon" />
                    <h3>Database Overview</h3>
                  </div>
                  <div className="stats-content">
                    <div className="stat-row">
                      <span>Total Molecules:</span>
                      <span className="stat-value">{dbStats.total_molecules}</span>
                    </div>
                    <div className="stat-row">
                      <span>Simulations Run:</span>
                      <span className="stat-value">{dbStats.total_simulations}</span>
                    </div>
                    <div className="stat-row">
                      <span>Avg. Molecular Weight:</span>
                      <span className="stat-value">{dbStats.avg_molecular_weight?.toFixed(1)} g/mol</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'simulations' && (
          <div className="simulations-section">
            {selectedMoleculeForSim ? (
              <SimulationVisualizations 
                molecule={selectedMoleculeForSim}
                molecules={activeView === 'rwanda' ? rwandaMolecules : molecules}
                isVisible={true}
              />
            ) : (
              <div className="no-molecule-selected">
                <div className="selection-prompt">
                  <Zap size={48} />
                  <h3>Select a Molecule for Quantum Simulation</h3>
                  <p>Choose a molecule from the Rwanda Agricultural or All Molecules tabs to run advanced quantum simulations and visualizations.</p>
                  <div className="selection-actions">
                    <button 
                      onClick={() => setActiveView('rwanda')}
                      className="action-button primary"
                    >
                      <Globe size={16} />
                      Browse Rwanda Molecules
                    </button>
                    <button 
                      onClick={() => setActiveView('all')}
                      className="action-button secondary"
                    >
                      <Database size={16} />
                      Browse All Molecules
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'admet' && (
          <div className="admet-analysis-section">
            <div className="admet-header">
              <div className="admet-title">
                <Pill size={32} />
                <div>
                  <h2>ADMET Properties Analysis</h2>
                  <p>Absorption, Distribution, Metabolism, Excretion & Toxicity predictions for agricultural molecules</p>
                </div>
              </div>
            </div>

            <div className="admet-molecules-grid">
              {(activeView === 'admet' ? rwandaMolecules : molecules).map((molecule) => {
                const admet = calculateADMETProperties(molecule);
                return (
                  <div key={molecule.id} className="admet-card">
                    <div className="admet-card-header">
                      <h4>{molecule.name}</h4>
                      <span className="admet-category-badge" style={{ backgroundColor: getCategoryColor(molecule.category) }}>
                        {molecule.category?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="admet-properties-display">
                      <div className="admet-property-row">
                        <div className="property-icon toxicity">
                          <AlertCircle size={20} />
                        </div>
                        <div className="property-info">
                          <span className="property-name">Toxicity Prediction</span>
                          <div className="property-bar">
                            <div 
                              className="property-fill" 
                              style={{ 
                                width: `${admet.toxicity.score}%`,
                                backgroundColor: admet.toxicity.color
                              }}
                            ></div>
                          </div>
                          <span className="property-detail">{admet.toxicity.level} ({admet.toxicity.score}/100)</span>
                        </div>
                      </div>

                      <div className="admet-property-row">
                        <div className="property-icon bioavailability">
                          <CheckCircle size={20} />
                        </div>
                        <div className="property-info">
                          <span className="property-name">Bioavailability</span>
                          <div className="property-bar">
                            <div 
                              className="property-fill" 
                              style={{ 
                                width: `${admet.bioavailability.score}%`,
                                backgroundColor: admet.bioavailability.color
                              }}
                            ></div>
                          </div>
                          <span className="property-detail">{admet.bioavailability.level} ({admet.bioavailability.score}%)</span>
                        </div>
                      </div>

                      <div className="admet-property-row">
                        <div className="property-icon persistence">
                          <Leaf size={20} />
                        </div>
                        <div className="property-info">
                          <span className="property-name">Environmental Persistence</span>
                          <div className="property-bar">
                            <div 
                              className="property-fill" 
                              style={{ 
                                width: `${Math.min(100, (admet.environmentalPersistence.days / 365) * 100)}%`,
                                backgroundColor: admet.environmentalPersistence.color
                              }}
                            ></div>
                          </div>
                          <span className="property-detail">{admet.environmentalPersistence.level} ({admet.environmentalPersistence.days} days)</span>
                        </div>
                      </div>

                      <div className="admet-property-row">
                        <div className="property-icon absorption">
                          <Droplets size={20} />
                        </div>
                        <div className="property-info">
                          <span className="property-name">Soil Absorption Rate</span>
                          <div className="property-bar">
                            <div 
                              className="property-fill" 
                              style={{ 
                                width: `${admet.soilAbsorption.score}%`,
                                backgroundColor: admet.soilAbsorption.color
                              }}
                            ></div>
                          </div>
                          <span className="property-detail">{admet.soilAbsorption.level} ({admet.soilAbsorption.score}%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="admet-card-footer">
                      <button 
                        onClick={() => onMoleculeSelect(molecule)}
                        className="admet-action-btn"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'designed' && (
          <div className="designed-section">
            <div className="designed-header">
              <div className="designed-title">
                <Zap size={32} />
                <div>
                  <h2>Designed Molecules & Materials</h2>
                  <p>Quantum-optimized compounds created through sub-atomic design and molecular engineering</p>
                </div>
              </div>
            </div>

            {designedMolecules.length === 0 ? (
              <div className="empty-state">
                <Hexagon size={48} />
                <h3>No Designed Molecules Yet</h3>
                <p>Designed molecules and materials will appear here once they are created through the quantum design process.</p>
              </div>
            ) : (
              <div className="designed-molecules-grid">
                {designedMolecules.map((molecule) => (
                  <div key={molecule.id} className="designed-card">
                    <div className="designed-card-header">
                      <div className="designed-info">
                        <h4>{molecule.name}</h4>
                        <span className="designed-badge">Quantum Designed</span>
                      </div>
                      <div className="designed-stats">
                        <div className="stat">
                          <Atom size={16} />
                          <span>{molecule.num_atoms || 0} atoms</span>
                        </div>
                        <div className="stat">
                          <Beaker size={16} />
                          <span>{molecule.molecular_weight?.toFixed(1) || 'N/A'} g/mol</span>
                        </div>
                      </div>
                    </div>

                    <div className="designed-visualization">
                      <MoleculeVisualization 
                        molecule={molecule} 
                        isActive={true}
                      />
                    </div>

                    <div className="designed-description">
                      <p>{molecule.description || molecule.rwanda_relevance || 'Advanced quantum-designed material'}</p>
                    </div>

                    <div className="designed-properties">
                      {molecule.formula && (
                        <div className="property-item">
                          <span className="property-label">Formula</span>
                          <span className="property-value">{molecule.formula}</span>
                        </div>
                      )}
                      <div className="property-item">
                        <span className="property-label">Category</span>
                        <span className="property-value">{molecule.category?.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="designed-actions">
                      <button 
                        onClick={() => {
                          setSelectedMoleculeForSim(molecule);
                          setActiveView('simulations');
                        }}
                        className="action-btn primary"
                      >
                        <Zap size={14} />
                        Simulate
                      </button>
                      <button 
                        onClick={() => onMoleculeSelect(molecule)}
                        className="action-btn secondary"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'spectroscopy' && (
          <div className="spectroscopy-section">
            <div className="spectroscopy-header">
              <div className="spectroscopy-title">
                <Waves size={32} />
                <div>
                  <h2>Simple Spectroscopy Analysis</h2>
                  <p>IR spectrum prediction, peak identification, and molecular fingerprinting</p>
                </div>
              </div>
            </div>

            <div className="spectroscopy-content">
              {selectedMoleculeForSim ? (
                <div className="spectroscopy-analysis">
                  {(() => {
                    const spectroData = calculateSpectroscopyData(selectedMoleculeForSim);
                    return (
                      <>
                        {/* IR Spectrum Section */}
                        <div className="spectro-card">
                          <div className="spectro-card-header">
                            <h3>
                              <BarChart2 size={20} />
                              IR Spectrum Prediction
                            </h3>
                            <span className="spectro-badge">{spectroData.irSpectrum.region}</span>
                          </div>

                          <div className="ir-spectrum-chart">
                            <div className="spectrum-axis">
                              <div className="y-axis">Intensity</div>
                              <div className="spectrum-bars">
                                {spectroData.irSpectrum.peaks.map((peak, idx) => (
                                  <div key={idx} className="spectrum-bar-container">
                                    <div 
                                      className="spectrum-bar"
                                      style={{ 
                                        height: `${peak.intensity * 100}%`,
                                        backgroundColor: `hsl(${200 + idx * 20}, 70%, 50%)`
                                      }}
                                      title={`${peak.name}: ${peak.freq} cm⁻¹ (${(peak.intensity * 100).toFixed(0)}%)`}
                                    ></div>
                                    <span className="bar-label">{peak.freq}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="x-axis">Wavenumber (cm⁻¹)</div>
                            </div>
                          </div>

                          <div className="spectrum-info">
                            <p><strong>Quality:</strong> {spectroData.irSpectrum.quality}</p>
                            <p><strong>Region:</strong> {spectroData.irSpectrum.region}</p>
                          </div>
                        </div>

                        {/* Peak Identification Section */}
                        <div className="spectro-card">
                          <div className="spectro-card-header">
                            <h3>
                              <Fingerprint size={20} />
                              Peak Identification
                            </h3>
                          </div>

                          <div className="peak-identification">
                            <div className="peak-stats">
                              <div className="peak-stat">
                                <span className="stat-label">Total Peaks</span>
                                <span className="stat-value">{spectroData.peakIdentification.totalPeaks}</span>
                              </div>
                              <div className="peak-stat strong">
                                <span className="stat-label">Strong</span>
                                <span className="stat-value">{spectroData.peakIdentification.strongPeaks}</span>
                              </div>
                              <div className="peak-stat medium">
                                <span className="stat-label">Medium</span>
                                <span className="stat-value">{spectroData.peakIdentification.mediumPeaks}</span>
                              </div>
                              <div className="peak-stat weak">
                                <span className="stat-label">Weak</span>
                                <span className="stat-value">{spectroData.peakIdentification.weakPeaks}</span>
                              </div>
                            </div>

                            <div className="peak-list">
                              <h4>Identified Peaks:</h4>
                              {spectroData.irSpectrum.peaks.map((peak, idx) => (
                                <div key={idx} className="peak-item">
                                  <span className="peak-name">{peak.name}</span>
                                  <span className="peak-freq">{peak.freq} cm⁻¹</span>
                                  <div className="peak-intensity-bar">
                                    <div 
                                      className="peak-intensity-fill"
                                      style={{ width: `${peak.intensity * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="peak-intensity">{(peak.intensity * 100).toFixed(0)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Molecular Fingerprint Section */}
                        <div className="spectro-card">
                          <div className="spectro-card-header">
                            <h3>
                              <Fingerprint size={20} />
                              Molecular Fingerprint
                            </h3>
                          </div>

                          <div className="fingerprint-display">
                            <div className="fingerprint-bits">
                              {spectroData.molecularFingerprint.bits.map((bit, idx) => (
                                <div 
                                  key={idx} 
                                  className={`fingerprint-bit ${bit ? 'active' : 'inactive'}`}
                                  title={`Bit ${idx + 1}: ${bit ? 'ON' : 'OFF'}`}
                                ></div>
                              ))}
                            </div>

                            <div className="fingerprint-metrics">
                              <div className="metric">
                                <span className="metric-label">Fingerprint Hash</span>
                                <span className="metric-value">{spectroData.molecularFingerprint.hash}%</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Similarity Score</span>
                                <span className="metric-value">{spectroData.molecularFingerprint.similarity}%</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Uniqueness</span>
                                <span className="metric-value">{spectroData.molecularFingerprint.uniqueness}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="fingerprint-info">
                            <p>The molecular fingerprint is a unique identifier for this compound based on its structural features. It can be used for similarity searching and compound classification.</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="spectroscopy-prompt">
                  <Waves size={48} />
                  <h3>Select a Molecule for Spectroscopy Analysis</h3>
                  <p>Choose a molecule from any tab to analyze its IR spectrum, identify peaks, and view its molecular fingerprint.</p>
                  <div className="selection-actions">
                    <button 
                      onClick={() => setActiveView('rwanda')}
                      className="action-button primary"
                    >
                      <Globe size={16} />
                      Browse Rwanda Molecules
                    </button>
                    <button 
                      onClick={() => setActiveView('all')}
                      className="action-button secondary"
                    >
                      <Database size={16} />
                      Browse All Molecules
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'similarity' && (
          <div className="similarity-section">
            <div className="similarity-header">
              <div className="similarity-title">
                <Link2 size={32} />
                <div>
                  <h2>Molecular Similarity Discovery</h2>
                  <p>Find similar compounds, predict agricultural activity, and explore structure-activity relationships</p>
                </div>
              </div>
            </div>

            <div className="similarity-content">
              {selectedMoleculeForSim ? (
                <div className="similarity-analysis">
                  {(() => {
                    const allMols = activeView === 'similarity' ? [...rwandaMolecules, ...molecules] : molecules;
                    const similarMols = calculateMolecularSimilarity(selectedMoleculeForSim, allMols);
                    
                    return (
                      <>
                        {/* Reference Molecule */}
                        <div className="reference-molecule">
                          <div className="ref-header">
                            <h3>Reference Molecule</h3>
                          </div>
                          <div className="ref-card">
                            <div className="ref-info">
                              <h4>{selectedMoleculeForSim.name}</h4>
                              <div className="ref-properties">
                                <div className="ref-prop">
                                  <span className="label">Molecular Weight</span>
                                  <span className="value">{selectedMoleculeForSim.molecular_weight?.toFixed(1)} g/mol</span>
                                </div>
                                <div className="ref-prop">
                                  <span className="label">Atoms</span>
                                  <span className="value">{selectedMoleculeForSim.num_atoms}</span>
                                </div>
                                <div className="ref-prop">
                                  <span className="label">Category</span>
                                  <span className="value">{selectedMoleculeForSim.category?.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Similar Compounds */}
                        <div className="similar-compounds">
                          <div className="sim-header">
                            <h3>
                              <Lightbulb size={20} />
                              Top {similarMols.length} Similar Compounds
                            </h3>
                          </div>

                          {similarMols.length === 0 ? (
                            <div className="no-results">
                              <p>No similar compounds found in the database.</p>
                            </div>
                          ) : (
                            <div className="similar-grid">
                              {similarMols.map((mol, idx) => (
                                <div key={mol.id} className="similarity-card">
                                  <div className="sim-rank">#{idx + 1}</div>
                                  
                                  <div className="sim-card-header">
                                    <h4>{mol.name}</h4>
                                    <span className="sim-badge">{mol.category?.replace('_', ' ')}</span>
                                  </div>

                                  {/* Similarity Score */}
                                  <div className="similarity-score">
                                    <div className="score-label">Structural Similarity</div>
                                    <div className="score-bar">
                                      <div 
                                        className="score-fill"
                                        style={{ 
                                          width: `${mol.similarity}%`,
                                          backgroundColor: mol.similarity > 80 ? '#10b981' : mol.similarity > 60 ? '#3b82f6' : '#f59e0b'
                                        }}
                                      ></div>
                                    </div>
                                    <div className="score-value">{mol.similarity}%</div>
                                  </div>

                                  {/* Agricultural Activity */}
                                  <div className="activity-section">
                                    <div className="activity-label">Agricultural Activity</div>
                                    <div className="activity-score">
                                      <span className={`activity-level ${mol.activityLevel.toLowerCase()}`}>
                                        {mol.activityLevel}
                                      </span>
                                      <span className="activity-value">{mol.activityScore}%</span>
                                    </div>
                                  </div>

                                  {/* Structure-Activity Relationships */}
                                  <div className="sar-section">
                                    <div className="sar-label">Structure-Activity Profile</div>
                                    <div className="sar-metrics">
                                      <div className="sar-metric">
                                        <span className="sar-name">Potency</span>
                                        <div className="sar-bar">
                                          <div 
                                            className="sar-fill"
                                            style={{ width: `${mol.sar.potency}%` }}
                                          ></div>
                                        </div>
                                        <span className="sar-value">{mol.sar.potency.toFixed(0)}%</span>
                                      </div>
                                      <div className="sar-metric">
                                        <span className="sar-name">Selectivity</span>
                                        <div className="sar-bar">
                                          <div 
                                            className="sar-fill"
                                            style={{ width: `${mol.sar.selectivity}%` }}
                                          ></div>
                                        </div>
                                        <span className="sar-value">{mol.sar.selectivity.toFixed(0)}%</span>
                                      </div>
                                      <div className="sar-metric">
                                        <span className="sar-name">Safety</span>
                                        <div className="sar-bar">
                                          <div 
                                            className="sar-fill"
                                            style={{ width: `${mol.sar.safety}%` }}
                                          ></div>
                                        </div>
                                        <span className="sar-value">{mol.sar.safety.toFixed(0)}%</span>
                                      </div>
                                      <div className="sar-metric">
                                        <span className="sar-name">Efficacy</span>
                                        <div className="sar-bar">
                                          <div 
                                            className="sar-fill"
                                            style={{ width: `${mol.sar.efficacy}%` }}
                                          ></div>
                                        </div>
                                        <span className="sar-value">{mol.sar.efficacy.toFixed(0)}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Match Reasons */}
                                  <div className="match-reasons">
                                    <div className="reasons-label">Why Similar:</div>
                                    <div className="reasons-list">
                                      {mol.matchReason.map((reason, ridx) => (
                                        <span key={ridx} className="reason-tag">{reason}</span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="sim-actions">
                                    <button 
                                      onClick={() => onMoleculeSelect(mol)}
                                      className="sim-btn primary"
                                    >
                                      <Eye size={14} />
                                      View
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setSelectedMoleculeForSim(mol);
                                      }}
                                      className="sim-btn secondary"
                                    >
                                      <TrendingDown size={14} />
                                      Explore
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="similarity-prompt">
                  <Link2 size={48} />
                  <h3>Select a Molecule for Similarity Analysis</h3>
                  <p>Choose a molecule to find similar compounds and explore their agricultural activity and structure-activity relationships.</p>
                  <div className="selection-actions">
                    <button 
                      onClick={() => setActiveView('rwanda')}
                      className="action-button primary"
                    >
                      <Globe size={16} />
                      Browse Rwanda Molecules
                    </button>
                    <button 
                      onClick={() => setActiveView('all')}
                      className="action-button secondary"
                    >
                      <Database size={16} />
                      Browse All Molecules
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    'natural_pesticide': '#10b981',
    'organic_pesticide': '#059669',
    'nitrogen_fertilizer': '#3b82f6',
    'potash_fertilizer': '#6366f1',
    'micronutrient_fertilizer': '#8b5cf6',
    'coffee_enhancement': '#92400e',
    'general': '#6b7280'
  };
  return colors[category] || '#6b7280';
}

export default EnhancedMolecularDatabase;
