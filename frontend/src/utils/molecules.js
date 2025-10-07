// molecules.js - Molecular data and utilities for Rwanda Agricultural Platform

export const MOLECULE_DATABASE = {
  water: {
    name: "Water (H₂O)",
    formula: "H₂O",
    atomString: "O 0 0 0; H 0.76 0.59 0; H -0.76 0.59 0",
    description: "Essential for all life processes",
    rwandaRelevance: "Irrigation efficiency and water management studies",
    category: "basic",
    atoms: [
      { symbol: 'O', x: 0, y: 0, z: 0 },
      { symbol: 'H', x: 0.76, y: 0.59, z: 0 },
      { symbol: 'H', x: -0.76, y: 0.59, z: 0 }
    ],
    expectedProperties: {
      dipole: 1.85,
      bioavailability: 'high',
      toxicity: 'none'
    }
  },

  pesticide: {
    name: "Bio-Pesticide Compound",
    formula: "C₂H₃NClO",
    atomString: "C 0 0 0; C 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Cl 0 -1.4 0; H 2.8 1.4 0",
    description: "Environmentally safe pesticide for crop protection",
    rwandaRelevance: "Fall armyworm control in maize crops",
    category: "pesticide",
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'C', x: 1.4, y: 0, z: 0 },
      { symbol: 'N', x: 2.8, y: 0, z: 0 },
      { symbol: 'O', x: 1.4, y: 1.4, z: 0 },
      { symbol: 'Cl', x: 0, y: -1.4, z: 0 },
      { symbol: 'H', x: 2.8, y: 1.4, z: 0 }
    ],
    expectedProperties: {
      dipole: 2.3,
      bioavailability: 'high',
      toxicity: 'low'
    }
  },

  nutrient: {
    name: "Iron Chelate Complex",
    formula: "C₂H₄N₂OFe",
    atomString: "C 0 0 0; N 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Fe 4.2 0.7 0",
    description: "Iron delivery system for nutrient-deficient crops",
    rwandaRelevance: "Combat iron deficiency in beans and leafy vegetables",
    category: "nutrient",
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'N', x: 1.4, y: 0, z: 0 },
      { symbol: 'N', x: 2.8, y: 0, z: 0 },
      { symbol: 'O', x: 1.4, y: 1.4, z: 0 },
      { symbol: 'Fe', x: 4.2, y: 0.7, z: 0 }
    ],
    expectedProperties: {
      dipole: 1.9,
      bioavailability: 'high',
      toxicity: 'none'
    }
  },

  caffeine: {
    name: "Caffeine",
    formula: "C₈H₁₀N₄O₂",
    atomString: "C 0 0 0; C 1.4 0 0; C 2.8 0 0; N 4.2 0 0; N 2.8 1.4 0; C 1.4 1.4 0; C 0 1.4 0; N 0 2.8 0; C 1.4 2.8 0; N 2.8 2.8 0; O 4.2 1.4 0; O 1.4 4.2 0",
    description: "Natural alkaloid found in coffee plants",
    rwandaRelevance: "Understanding coffee plant biochemistry",
    category: "natural",
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'C', x: 1.4, y: 0, z: 0 },
      { symbol: 'C', x: 2.8, y: 0, z: 0 },
      { symbol: 'N', x: 4.2, y: 0, z: 0 },
      { symbol: 'N', x: 2.8, y: 1.4, z: 0 },
      { symbol: 'C', x: 1.4, y: 1.4, z: 0 },
      { symbol: 'C', x: 0, y: 1.4, z: 0 },
      { symbol: 'N', x: 0, y: 2.8, z: 0 },
      { symbol: 'O', x: 4.2, y: 1.4, z: 0 },
      { symbol: 'O', x: 1.4, y: 4.2, z: 0 }
    ],
    expectedProperties: {
      dipole: 3.6,
      bioavailability: 'high',
      toxicity: 'low'
    }
  }
};

export const RWANDA_CONTEXT = {
  districts: [
    'Gasabo', 'Nyarugenge', 'Kicukiro', 'Burera', 'Gakenke', 
    'Gicumbi', 'Musanze', 'Rulindo', 'Huye', 'Kamonyi'
  ],
  
  crops: [
    { name: 'Maize', season: 'A & B', priority: 'high' },
    { name: 'Beans', season: 'A & B', priority: 'high' },
    { name: 'Coffee', season: 'Perennial', priority: 'export' },
    { name: 'Tea', season: 'Perennial', priority: 'export' },
    { name: 'Cassava', season: 'A, B & C', priority: 'food security' },
    { name: 'Potato', season: 'B & C', priority: 'medium' }
  ],

  pests: [
    { name: 'Fall Armyworm', severity: 'high', crops: ['Maize'] },
    { name: 'Coffee Berry Borer', severity: 'high', crops: ['Coffee'] },
    { name: 'Bean Stem Maggot', severity: 'medium', crops: ['Beans'] },
    { name: 'Potato Late Blight', severity: 'high', crops: ['Potato'] }
  ],

  nutrients: [
    { name: 'Iron', deficiency: 38, crops: ['Beans', 'Leafy vegetables'] },
    { name: 'Zinc', deficiency: 42, crops: ['Maize', 'Beans'] },
    { name: 'Vitamin A', deficiency: 25, crops: ['Cassava', 'Sweet potato'] }
  ]
};

export const SIMULATION_METHODS = [
  {
    id: 'vqe',
    name: 'Quantum VQE',
    description: 'Variational Quantum Eigensolver - Most accurate for small molecules',
    advantages: ['High precision', 'Quantum advantage', 'Future-ready'],
    limitations: ['Computationally intensive', 'Limited to small systems']
  },
  {
    id: 'hf',
    name: 'Classical HF',
    description: 'Hartree-Fock Method - Fast and reliable baseline',
    advantages: ['Fast computation', 'Well established', 'Good for comparison'],
    limitations: ['Less accurate for correlated systems']
  },
  {
    id: 'dft',
    name: 'DFT',
    description: 'Density Functional Theory - Balance of speed and accuracy',
    advantages: ['Good accuracy', 'Reasonable speed', 'Handles larger systems'],
    limitations: ['Approximate exchange-correlation']
  }
];

// Utility functions
export const parseMoleculeString = (moleculeString) => {
  const atoms = [];
  const lines = moleculeString.split(';');
  
  lines.forEach((line, index) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 4) {
      atoms.push({
        id: index,
        symbol: parts[0],
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
        z: parseFloat(parts[3])
      });
    }
  });
  
  return atoms;
};

export const calculateMolecularWeight = (atoms) => {
  const atomicWeights = {
    H: 1.008, C: 12.011, N: 14.007, O: 15.999,
    P: 30.974, S: 32.065, Cl: 35.453, F: 18.998,
    Fe: 55.845, Zn: 65.38, Ca: 40.078, Mg: 24.305
  };
  
  return atoms.reduce((total, atom) => {
    return total + (atomicWeights[atom.symbol] || 0);
  }, 0);
};

export const estimateAgriculturalImpact = (molecule, simulationResults) => {
  const mw = calculateMolecularWeight(molecule.atoms);
  const category = molecule.category;
  
  let impact = {
    farmersReached: 0,
    yieldIncrease: 0,
    costReduction: 0,
    environmentalBenefit: 0
  };

  if (simulationResults && simulationResults.success) {
    const activity = simulationResults.agricultural_activity || {};
    const pesticideScore = activity.pesticide_activity_score || 0.5;
    
    switch (category) {
      case 'pesticide':
        impact.farmersReached = Math.floor(pesticideScore * 50000);
        impact.yieldIncrease = Math.floor(pesticideScore * 25);
        impact.costReduction = Math.floor(pesticideScore * 30);
        impact.environmentalBenefit = 80;
        break;
      case 'nutrient':
        impact.farmersReached = Math.floor(pesticideScore * 75000);
        impact.yieldIncrease = Math.floor(pesticideScore * 35);
        impact.costReduction = Math.floor(pesticideScore * 20);
        impact.environmentalBenefit = 60;
        break;
      default:
        impact.farmersReached = Math.floor(pesticideScore * 25000);
        impact.yieldIncrease = Math.floor(pesticideScore * 15);
        impact.costReduction = Math.floor(pesticideScore * 15);
        impact.environmentalBenefit = 40;
    }
  }

  return impact;
};

export const generateMockSimulationData = (moleculeType) => {
  const baseData = {
    success: true,
    computation_time_ms: 120 + Math.random() * 100,
    method_used: 'vqe'
  };

  switch (moleculeType) {
    case 'water':
      return {
        ...baseData,
        classical_energy: -76.3,
        quantum_energy: -76.28,
        dipole_moment: [0.0, 0.0, 1.85],
        agricultural_activity: {
          pesticide_activity_score: 0.3,
          bioavailability_prediction: 'high'
        }
      };
    case 'pesticide':
      return {
        ...baseData,
        classical_energy: -245.7,
        quantum_energy: -245.65,
        dipole_moment: [1.2, 0.8, 2.3],
        agricultural_activity: {
          pesticide_activity_score: 0.85,
          bioavailability_prediction: 'high'
        }
      };
    case 'nutrient':
      return {
        ...baseData,
        classical_energy: -1847.2,
        quantum_energy: -1847.15,
        dipole_moment: [0.5, 1.1, 1.9],
        agricultural_activity: {
          pesticide_activity_score: 0.72,
          bioavailability_prediction: 'high'
        }
      };
    default:
      return {
        ...baseData,
        classical_energy: -150.0,
        quantum_energy: -149.95,
        dipole_moment: [0.3, 0.3, 1.2],
        agricultural_activity: {
          pesticide_activity_score: 0.5,
          bioavailability_prediction: 'medium'
        }
      };
  }
};

export const formatEnergy = (energy) => {
  if (energy === null || energy === undefined) return 'N/A';
  return `${energy.toFixed(3)} Ha`;
};

export const formatDipole = (dipoleArray) => {
  if (!dipoleArray || !Array.isArray(dipoleArray)) return 'N/A';
  const magnitude = Math.sqrt(dipoleArray[0]**2 + dipoleArray[1]**2 + dipoleArray[2]**2);
  return `${magnitude.toFixed(3)} D`;
};

export const getBondDistance = (atom1, atom2) => {
  return Math.sqrt(
    Math.pow(atom1.x - atom2.x, 2) +
    Math.pow(atom1.y - atom2.y, 2) +
    Math.pow(atom1.z - atom2.z, 2)
  );
};

export const findBonds = (atoms, maxDistance = 2.0) => {
  const bonds = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const distance = getBondDistance(atoms[i], atoms[j]);
      if (distance < maxDistance) {
        bonds.push({
          atom1: i,
          atom2: j,
          distance: distance,
          start: [atoms[i].x, atoms[i].y, atoms[i].z],
          end: [atoms[j].x, atoms[j].y, atoms[j].z]
        });
      }
    }
  }
  return bonds;
};