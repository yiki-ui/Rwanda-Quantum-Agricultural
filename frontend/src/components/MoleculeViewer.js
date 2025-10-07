import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Atom colors based on CPK coloring convention
const ATOM_COLORS = {
  H: '#ffffff',  // White
  C: '#909090',  // Gray
  N: '#3050f8',  // Blue
  O: '#ff0d0d',  // Red
  P: '#ff8000',  // Orange
  S: '#ffff30',  // Yellow
  Cl: '#1ff01f', // Green
  F: '#90e050',  // Light Green
  Fe: '#e06633', // Orange-red
  Zn: '#7d80b0', // Blue-gray
};

const ATOM_SIZES = {
  H: 0.3,
  C: 0.5,
  N: 0.5,
  O: 0.5,
  P: 0.6,
  S: 0.6,
  Cl: 0.7,
  F: 0.4,
  Fe: 0.7,
  Zn: 0.6,
};

function Atom({ position, element, label, glowing = false }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current && glowing) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const color = ATOM_COLORS[element] || '#cccccc';
  const size = ATOM_SIZES[element] || 0.5;
  const scaledSize = hovered ? size * 1.3 : size;

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[scaledSize, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          metalness={0.3}
          roughness={0.4}
          emissive={glowing ? color : '#000000'}
          emissiveIntensity={glowing ? 0.2 : 0}
        />
      </Sphere>
      
      {hovered && (
        <Text
          position={[0, scaledSize + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {element}
        </Text>
      )}
    </group>
  );
}

function Bond({ start, end, order = 1 }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color="#666666"
      lineWidth={order * 2}
    />
  );
}

function MoleculeStructure({ moleculeType, simulationResults }) {
  // Predefined molecule structures for demo
  const molecules = {
    water: [
      { symbol: 'O', x: 0, y: 0, z: 0 },
      { symbol: 'H', x: 0.76, y: 0.59, z: 0 },
      { symbol: 'H', x: -0.76, y: 0.59, z: 0 }
    ],
    pesticide: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'C', x: 1.4, y: 0, z: 0 },
      { symbol: 'N', x: 2.8, y: 0, z: 0 },
      { symbol: 'O', x: 1.4, y: 1.4, z: 0 },
      { symbol: 'Cl', x: 0, y: -1.4, z: 0 },
      { symbol: 'H', x: 2.8, y: 1.4, z: 0 }
    ],
    nutrient: [
      { symbol: 'C', x: 0, y: 0, z: 0 },
      { symbol: 'N', x: 1.4, y: 0, z: 0 },
      { symbol: 'N', x: 2.8, y: 0, z: 0 },
      { symbol: 'O', x: 1.4, y: 1.4, z: 0 },
      { symbol: 'Fe', x: 4.2, y: 0.7, z: 0 }
    ]
  };

  const atoms = simulationResults?.atom_data || molecules[moleculeType] || molecules.water;
  const isQuantumActive = simulationResults?.quantum_energy;

  // Simple bond detection (atoms within 2 Angstroms)
  const bonds = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];
      const distance = Math.sqrt(
        Math.pow(atom1.x - atom2.x, 2) +
        Math.pow(atom1.y - atom2.y, 2) +
        Math.pow(atom1.z - atom2.z, 2)
      );
      if (distance < 2.0) {
        bonds.push({
          start: [atom1.x, atom1.y, atom1.z],
          end: [atom2.x, atom2.y, atom2.z]
        });
      }
    }
  }

  return (
    <group>
      {/* Render bonds first (behind atoms) */}
      {bonds.map((bond, index) => (
        <Bond key={`bond-${index}`} start={bond.start} end={bond.end} />
      ))}
      
      {/* Render atoms */}
      {atoms.map((atom, index) => (
        <Atom
          key={`atom-${index}`}
          position={[atom.x, atom.y, atom.z]}
          element={atom.symbol}
          glowing={isQuantumActive}
        />
      ))}
      
      {/* Quantum field visualization */}
      {isQuantumActive && (
        <mesh>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
}

function Scene({ moleculeType, simulationResults }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <MoleculeStructure 
        moleculeType={moleculeType} 
        simulationResults={simulationResults}
      />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        maxDistance={20}
        minDistance={2}
      />
      
      {/* Grid for reference */}
      <gridHelper args={[10, 10]} />
    </>
  );
}

function MoleculeViewer({ moleculeType, simulationResults }) {
  const [error, setError] = useState(false);

  return (
    <div className="molecule-viewer">
      <div className="viewer-header">
        <h3>3D Molecular Visualization</h3>
        <div className="viewer-info">
          <span className={`status ${simulationResults ? 'active' : 'inactive'}`}>
            {simulationResults ? 'Quantum Active' : 'Classical View'}
          </span>
        </div>
      </div>
      
      <div className="canvas-container">
        {error ? (
          <div className="error-message">
            <p>WebGL not supported. Please use a modern browser.</p>
          </div>
        ) : (
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            onError={() => setError(true)}
          >
            <Suspense fallback={null}>
              <Scene 
                moleculeType={moleculeType}
                simulationResults={simulationResults}
              />
            </Suspense>
          </Canvas>
        )}
      </div>
      
      <div className="viewer-controls">
        <div className="control-hint">
          <span>🖱️ Drag to rotate | 🔍 Scroll to zoom | 🤏 Right-click to pan</span>
        </div>
      </div>
    </div>
  );
}

export default MoleculeViewer;