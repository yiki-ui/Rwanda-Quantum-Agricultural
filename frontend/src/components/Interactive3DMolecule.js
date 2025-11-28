import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// Atom colors and sizes based on element (CPK coloring convention)
const atomProperties = {
  H: { color: '#FFFFFF', radius: 0.3, name: 'Hydrogen' },
  C: { color: '#404040', radius: 0.7, name: 'Carbon' },
  N: { color: '#3050F8', radius: 0.65, name: 'Nitrogen' },
  O: { color: '#FF0D0D', radius: 0.6, name: 'Oxygen' },
  P: { color: '#FF8000', radius: 1.0, name: 'Phosphorus' },
  S: { color: '#FFFF30', radius: 1.0, name: 'Sulfur' },
  Cl: { color: '#1FF01F', radius: 0.99, name: 'Chlorine' },
  F: { color: '#90E050', radius: 0.5, name: 'Fluorine' },
  Fe: { color: '#E06633', radius: 1.2, name: 'Iron' },
  Zn: { color: '#7D80B0', radius: 1.2, name: 'Zinc' },
  Ca: { color: '#3DFF00', radius: 1.8, name: 'Calcium' },
  Mg: { color: '#8AFF00', radius: 1.5, name: 'Magnesium' }
};

// Helper functions for color manipulation
const lightenColor = (color, amount) => {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
};

const darkenColor = (color, amount) => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
};

const Interactive3DMolecule = ({ atomData, selectedMolecule }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(Date.now());
  const fpsHistoryRef = useRef([]);

  // Core state
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.3, z: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredAtom, setHoveredAtom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // New enhancement states
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showFPS, setShowFPS] = useState(false);
  const [fps, setFPS] = useState(60);
  const [depthFog, setDepthFog] = useState(true);
  const [ambientOcclusion, setAmbientOcclusion] = useState(true);

  // Quantum visualization states
  const [showQuantumGrid, setShowQuantumGrid] = useState(true);
  const [showVertexSphere, setShowVertexSphere] = useState(true);
  const [quantumGridSize, setQuantumGridSize] = useState(100);
  const [vertexSphereRadius, setVertexSphereRadius] = useState(150);

  // 3D transformation functions
  const rotateX = (point, angle) => ({
    x: point.x,
    y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
    z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
  });

  const rotateY = (point, angle) => ({
    x: point.x * Math.cos(angle) + point.z * Math.sin(angle),
    y: point.y,
    z: -point.x * Math.sin(angle) + point.z * Math.cos(angle)
  });

  const rotateZ = (point, angle) => ({
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
    z: point.z
  });

  const project3DTo2D = useCallback((point3D) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0, z: point3D.z, depthFactor: 1 };
    }

    const perspective = 800;
    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;
    const zOffset = 200;

    const scaledZ = perspective + point3D.z + zOffset;
    const projectedX = centerX + (point3D.x * perspective) / scaledZ * scale;
    const projectedY = centerY + (point3D.y * perspective) / scaledZ * scale;

    // Calculate depth factor for fog and size scaling
    const depthFactor = Math.max(0.3, Math.min(1, scaledZ / 1000));

    return {
      x: projectedX,
      y: projectedY,
      z: point3D.z,
      depthFactor
    };
  }, [offset, scale]);

  const transformAtom = useCallback((atom) => {
    let point = { x: atom.x * 50, y: atom.y * 50, z: atom.z * 50 };

    point = rotateX(point, rotation.x);
    point = rotateY(point, rotation.y);
    point = rotateZ(point, rotation.z);

    return point;
  }, [rotation]);

  // Calculate bonds between atoms based on chemistry-aware distance thresholds
  const calculateBonds = useCallback((atoms, rotationState) => {
    if (!atoms || atoms.length < 2) return [];

    // Covalent radii in Angstroms for common elements
    const covalentRadii = {
      H: 0.31, C: 0.76, N: 0.71, O: 0.66,
      P: 1.07, S: 1.05, Cl: 1.02, F: 0.57,
      Fe: 1.32, Zn: 1.22, Ca: 1.76, Mg: 1.41
    };

    // Known bond type rules based on atom pairs and distances
    const getBondType = (symbol1, symbol2, distance) => {
      const r1 = covalentRadii[symbol1] || 0.7;
      const r2 = covalentRadii[symbol2] || 0.7;
      const expectedSingle = r1 + r2;

      // Tolerance for bond detection (±30% of expected single bond length)
      const maxBondDistance = expectedSingle * 1.3;

      if (distance > maxBondDistance) {
        return null; // No bond
      }

      // Special cases for common bonds
      const pair = [symbol1, symbol2].sort().join('-');

      // Hydrogen bonds are always single
      if (symbol1 === 'H' || symbol2 === 'H') {
        return 'single';
      }

      // C-C bonds: classify by distance
      if (pair === 'C-C') {
        if (distance < 1.25) return 'triple';  // C≡C ~1.20 Å
        if (distance < 1.40) return 'double';  // C=C ~1.34 Å
        return 'single';                        // C-C ~1.54 Å
      }

      // C-N bonds
      if (pair === 'C-N') {
        if (distance < 1.20) return 'triple';  // C≡N ~1.16 Å
        if (distance < 1.35) return 'double';  // C=N ~1.29 Å
        return 'single';                        // C-N ~1.47 Å
      }

      // C-O bonds
      if (pair === 'C-O') {
        if (distance < 1.25) return 'double';  // C=O ~1.20 Å
        return 'single';                        // C-O ~1.43 Å
      }

      // N-N bonds
      if (pair === 'N-N') {
        if (distance < 1.15) return 'triple';  // N≡N ~1.10 Å
        if (distance < 1.30) return 'double';  // N=N ~1.25 Å
        return 'single';                        // N-N ~1.45 Å
      }

      // O-O bonds
      if (pair === 'O-O') {
        if (distance < 1.25) return 'double';  // O=O ~1.21 Å
        return 'single';                        // O-O ~1.48 Å
      }

      // Default: use distance relative to expected single bond
      const ratio = distance / expectedSingle;
      if (ratio < 0.85) return 'triple';
      if (ratio < 0.95) return 'double';
      return 'single';
    };

    const bonds = [];

    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const atom1 = atoms[i];
        const atom2 = atoms[j];

        // Calculate distance in 3D space (original coordinates)
        const dx = atom1.x - atom2.x;
        const dy = atom1.y - atom2.y;
        const dz = atom1.z - atom2.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const bondType = getBondType(atom1.symbol, atom2.symbol, distance);

        if (bondType) {
          bonds.push({
            i,
            j,
            distance,
            type: bondType,
            atom1Symbol: atom1.symbol,
            atom2Symbol: atom2.symbol
          });
        }
      }
    }

    return bonds;
  }, []);

  // Recalculate bonds whenever atoms change (bonds are based on original 3D coordinates, not rotation)
  const bonds = useMemo(() => {
    return calculateBonds(atomData, null);
  }, [atomData, calculateBonds]);

  // Generate quantum grid points (responsive to molecule size and position)
  const generateQuantumGrid = useCallback(() => {
    if (!atomData || atomData.length === 0) return [];

    // Calculate molecule bounds
    const bounds = {
      minX: Math.min(...atomData.map(atom => atom.x)),
      maxX: Math.max(...atomData.map(atom => atom.x)),
      minY: Math.min(...atomData.map(atom => atom.y)),
      maxY: Math.max(...atomData.map(atom => atom.y)),
      minZ: Math.min(...atomData.map(atom => atom.z)),
      maxZ: Math.max(...atomData.map(atom => atom.z))
    };

    // Calculate molecule center
    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2
    };

    // Calculate molecule size and add padding
    const moleculeSize = Math.max(
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
      bounds.maxZ - bounds.minZ
    );

    const gridSize = Math.max(quantumGridSize, moleculeSize * 80); // Scale with molecule
    const gridSpacing = gridSize / 8; // Fewer lines for better performance
    const halfGrid = gridSize / 2;

    const gridPoints = [];

    // Create 3D grid centered on molecule
    for (let x = -halfGrid; x <= halfGrid; x += gridSpacing) {
      for (let y = -halfGrid; y <= halfGrid; y += gridSpacing) {
        for (let z = -halfGrid; z <= halfGrid; z += gridSpacing) {
          gridPoints.push({
            x: x + center.x * 50, // Scale to match atom coordinates
            y: y + center.y * 50,
            z: z + center.z * 50
          });
        }
      }
    }
    return gridPoints;
  }, [quantumGridSize, atomData]);

  // Generate vertex sphere points (responsive to molecule size and position)
  const generateVertexSphere = useCallback(() => {
    if (!atomData || atomData.length === 0) return [];

    // Calculate molecule bounds and center
    const bounds = {
      minX: Math.min(...atomData.map(atom => atom.x)),
      maxX: Math.max(...atomData.map(atom => atom.x)),
      minY: Math.min(...atomData.map(atom => atom.y)),
      maxY: Math.max(...atomData.map(atom => atom.y)),
      minZ: Math.min(...atomData.map(atom => atom.z)),
      maxZ: Math.max(...atomData.map(atom => atom.z))
    };

    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2
    };

    // Calculate adaptive radius based on molecule size
    const moleculeSize = Math.max(
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
      bounds.maxZ - bounds.minZ
    );

    const radius = Math.max(vertexSphereRadius, moleculeSize * 100); // Scale with molecule
    const vertices = [];
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

    // Icosahedron vertices (20-sided polyhedron for quantum field representation)
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    // Add icosahedron vertices centered on molecule
    baseVertices.forEach(([x, y, z]) => {
      const length = Math.sqrt(x * x + y * y + z * z);
      vertices.push({
        x: (x / length) * radius + center.x * 50,
        y: (y / length) * radius + center.y * 50,
        z: (z / length) * radius + center.z * 50
      });
    });

    // Add additional vertices for quantum field density around molecule
    const numExtraVertices = Math.min(50, Math.max(20, atomData.length * 5)); // Scale with molecule complexity
    for (let i = 0; i < numExtraVertices; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // Create multiple shells for layered quantum field effect
      const shellRadius = radius * (0.7 + Math.random() * 0.6); // Vary radius for depth

      vertices.push({
        x: shellRadius * Math.sin(phi) * Math.cos(theta) + center.x * 50,
        y: shellRadius * Math.sin(phi) * Math.sin(theta) + center.y * 50,
        z: shellRadius * Math.cos(phi) + center.z * 50
      });
    }

    return vertices;
  }, [vertexSphereRadius, atomData]);

  // Draw enhanced quantum grid with depth-based rendering
  const drawQuantumGrid = useCallback((ctx) => {
    if (!showQuantumGrid || !ctx) return;

    const gridPoints = generateQuantumGrid();
    const transformedPoints = gridPoints.map(point => {
      let transformed = { ...point };
      transformed = rotateX(transformed, rotation.x);
      transformed = rotateY(transformed, rotation.y);
      transformed = rotateZ(transformed, rotation.z);
      return project3DTo2D(transformed);
    });

    if (gridPoints.length === 0) return;

    // Calculate dynamic grid parameters
    const moleculeSize = atomData ? Math.max(
      Math.max(...atomData.map(atom => atom.x)) - Math.min(...atomData.map(atom => atom.x)),
      Math.max(...atomData.map(atom => atom.y)) - Math.min(...atomData.map(atom => atom.y)),
      Math.max(...atomData.map(atom => atom.z)) - Math.min(...atomData.map(atom => atom.z))
    ) : 1;

    const adaptiveGridSize = Math.max(quantumGridSize, moleculeSize * 80);
    const pointsPerLine = 9; // Fixed for 8 divisions

    // Base opacity with adaptive scaling
    const baseOpacity = Math.max(0.12, 0.35 / scale);
    const baseLineWidth = Math.max(0.4, 1.2 / scale);

    // Helper function to draw a grid line with depth-based effects
    const drawGridLine = (indices, direction) => {
      ctx.beginPath();
      let hasValidPoints = false;

      indices.forEach((index, i) => {
        if (index < transformedPoints.length) {
          const point = transformedPoints[index];
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
          hasValidPoints = true;
        }
      });

      if (hasValidPoints) {
        // Calculate average depth for this line
        const avgDepth = indices.reduce((sum, idx) => {
          if (idx < transformedPoints.length) {
            return sum + transformedPoints[idx].z;
          }
          return sum;
        }, 0) / indices.length;

        // Depth-based opacity (farther = more transparent)
        const depthFactor = Math.max(0.3, Math.min(1, (avgDepth + 400) / 800));
        const opacity = baseOpacity * depthFactor;

        // Color shift based on depth (cyan to blue)
        const colorShift = Math.floor(depthFactor * 100);
        ctx.strokeStyle = `rgba(0, ${200 + colorShift}, 255, ${opacity})`;
        ctx.lineWidth = baseLineWidth * depthFactor;
        ctx.shadowColor = `rgba(0, 255, 255, ${opacity * 0.8})`;
        ctx.shadowBlur = Math.max(1, 4 / scale) * depthFactor;

        ctx.stroke();
      }
    };

    // Draw grid lines in X direction (with depth sorting)
    for (let y = 0; y < pointsPerLine; y++) {
      for (let z = 0; z < pointsPerLine; z++) {
        const indices = [];
        for (let x = 0; x < pointsPerLine; x++) {
          indices.push(x + y * pointsPerLine + z * pointsPerLine * pointsPerLine);
        }
        drawGridLine(indices, 'x');
      }
    }

    // Draw grid lines in Y direction
    for (let x = 0; x < pointsPerLine; x++) {
      for (let z = 0; z < pointsPerLine; z++) {
        const indices = [];
        for (let y = 0; y < pointsPerLine; y++) {
          indices.push(x + y * pointsPerLine + z * pointsPerLine * pointsPerLine);
        }
        drawGridLine(indices, 'y');
      }
    }

    // Draw grid lines in Z direction
    for (let x = 0; x < pointsPerLine; x++) {
      for (let y = 0; y < pointsPerLine; y++) {
        const indices = [];
        for (let z = 0; z < pointsPerLine; z++) {
          indices.push(x + y * pointsPerLine + z * pointsPerLine * pointsPerLine);
        }
        drawGridLine(indices, 'z');
      }
    }

    // Draw grid intersection points for enhanced visual
    transformedPoints.forEach((point, idx) => {
      const depthFactor = Math.max(0.3, Math.min(1, (point.z + 400) / 800));
      const pointRadius = Math.max(0.5, 1.5 / scale) * depthFactor;
      const pointOpacity = baseOpacity * 0.6 * depthFactor;

      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0, 255, 255, ${pointOpacity})`;
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }, [showQuantumGrid, generateQuantumGrid, rotation, project3DTo2D, quantumGridSize, atomData, scale]);

  // Draw enhanced vertex sphere (quantum field visualization)
  const drawVertexSphere = useCallback((ctx) => {
    if (!showVertexSphere || !ctx) return;

    const vertices = generateVertexSphere();
    const transformedVertices = vertices.map(vertex => {
      let transformed = { ...vertex };
      transformed = rotateX(transformed, rotation.x);
      transformed = rotateY(transformed, rotation.y);
      transformed = rotateZ(transformed, rotation.z);
      return project3DTo2D(transformed);
    });

    // Sort vertices by depth for proper layering
    transformedVertices.sort((a, b) => b.z - a.z);

    // Calculate adaptive parameters based on molecule size
    const moleculeSize = atomData ? Math.max(
      Math.max(...atomData.map(atom => atom.x)) - Math.min(...atomData.map(atom => atom.x)),
      Math.max(...atomData.map(atom => atom.y)) - Math.min(...atomData.map(atom => atom.y)),
      Math.max(...atomData.map(atom => atom.z)) - Math.min(...atomData.map(atom => atom.z))
    ) : 1;

    const connectionDistance = Math.max(60, Math.min(180, moleculeSize * 25 * scale));
    const baseOpacity = Math.max(0.12, 0.35 / Math.sqrt(scale));

    // Draw quantum field connections with enhanced visuals
    ctx.lineWidth = Math.max(0.6, 2 / scale);

    // First pass: draw background connections (farther vertices)
    transformedVertices.forEach((vertex, i) => {
      if (vertex.z < 0) { // Only back vertices
        transformedVertices.slice(i + 1).forEach((otherVertex, j) => {
          if (j % 3 === 0 && otherVertex.z < 0) {
            const dx = vertex.x - otherVertex.x;
            const dy = vertex.y - otherVertex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              const depthFade = Math.max(0.3, (vertex.z + otherVertex.z + 600) / 1200);
              const opacity = Math.max(0.02, baseOpacity * (1 - distance / connectionDistance) * depthFade * 0.5);

              // Create gradient for depth effect
              const gradient = ctx.createLinearGradient(vertex.x, vertex.y, otherVertex.x, otherVertex.y);
              gradient.addColorStop(0, `rgba(180, 0, 255, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(255, 0, 255, ${opacity * 1.2})`);
              gradient.addColorStop(1, `rgba(180, 0, 255, ${opacity})`);

              ctx.strokeStyle = gradient;
              ctx.shadowColor = '#ff00ff';
              ctx.shadowBlur = Math.max(1, 3 / scale);
              ctx.beginPath();
              ctx.moveTo(vertex.x, vertex.y);
              ctx.lineTo(otherVertex.x, otherVertex.y);
              ctx.stroke();
            }
          }
        });
      }
    });

    // Second pass: draw foreground connections (closer vertices)
    transformedVertices.forEach((vertex, i) => {
      if (vertex.z >= 0 && i % 2 === 0) { // Only front vertices
        transformedVertices.slice(i + 1).forEach((otherVertex, j) => {
          if (j % 2 === 0 && otherVertex.z >= 0) {
            const dx = vertex.x - otherVertex.x;
            const dy = vertex.y - otherVertex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              const depthFade = Math.max(0.5, (vertex.z + otherVertex.z + 600) / 1200);
              const opacity = Math.max(0.03, baseOpacity * (1 - distance / connectionDistance) * depthFade);

              // Brighter gradient for foreground
              const gradient = ctx.createLinearGradient(vertex.x, vertex.y, otherVertex.x, otherVertex.y);
              gradient.addColorStop(0, `rgba(255, 0, 255, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(255, 100, 255, ${opacity * 1.3})`);
              gradient.addColorStop(1, `rgba(255, 0, 255, ${opacity})`);

              ctx.strokeStyle = gradient;
              ctx.shadowColor = '#ff00ff';
              ctx.shadowBlur = Math.max(2, 5 / scale);
              ctx.beginPath();
              ctx.moveTo(vertex.x, vertex.y);
              ctx.lineTo(otherVertex.x, otherVertex.y);
              ctx.stroke();
            }
          }
        });
      }
    });

    ctx.shadowBlur = 0;

    // Draw vertices with enhanced depth-based rendering
    transformedVertices.forEach((vertex, idx) => {
      const depthFactor = Math.max(0.3, Math.min(1, (vertex.z + 400) / 800));
      const baseRadius = Math.max(1.2, 3.5 / scale);
      const radius = baseRadius * depthFactor;
      const opacity = Math.max(0.35, baseOpacity * 1.2);

      // Outer glow (largest)
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius * 3.5, 0, 2 * Math.PI);
      const outerGlow = ctx.createRadialGradient(vertex.x, vertex.y, 0, vertex.x, vertex.y, radius * 3.5);
      outerGlow.addColorStop(0, `rgba(255, 0, 255, ${opacity * 0.4 * depthFactor})`);
      outerGlow.addColorStop(0.5, `rgba(255, 0, 255, ${opacity * 0.2 * depthFactor})`);
      outerGlow.addColorStop(1, `rgba(255, 0, 255, 0)`);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Middle glow
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius * 2, 0, 2 * Math.PI);
      const middleGlow = ctx.createRadialGradient(vertex.x, vertex.y, 0, vertex.x, vertex.y, radius * 2);
      middleGlow.addColorStop(0, `rgba(255, 50, 255, ${opacity * 0.6 * depthFactor})`);
      middleGlow.addColorStop(1, `rgba(255, 0, 255, ${opacity * 0.3 * depthFactor})`);
      ctx.fillStyle = middleGlow;
      ctx.fill();

      // Main vertex point
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 0, 255, ${opacity * depthFactor})`;
      ctx.fill();

      // Bright core with depth-based color shift
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius * 0.5, 0, 2 * Math.PI);
      const coreColor = depthFactor > 0.7 ? '255, 200, 255' : '255, 255, 255';
      ctx.fillStyle = `rgba(${coreColor}, ${opacity * 0.9 * depthFactor})`;
      ctx.fill();
    });
  }, [showVertexSphere, generateVertexSphere, rotation, project3DTo2D, atomData, scale]);

  // Enhanced drawing with photorealistic improvements
  const drawMolecule = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !atomData || !Array.isArray(atomData) || atomData.length === 0) return;

    const ctx = canvas.getContext('2d');

    // Draw dark gradient background (black to dark gray) for professional look
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#000000');
    bgGradient.addColorStop(0.5, '#0a0a0a');
    bgGradient.addColorStop(1, '#1a1510');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw quantum background elements first (behind molecules)
    drawQuantumGrid(ctx);
    drawVertexSphere(ctx);

    // Transform and project all atoms
    const transformedAtoms = atomData.map(atom => {
      const transformed = transformAtom(atom);
      const projected = project3DTo2D(transformed);
      return {
        ...atom,
        transformed,
        projected,
        properties: atomProperties[atom.symbol] || atomProperties.C
      };
    });

    // Sort by z-depth for proper rendering
    transformedAtoms.sort((a, b) => b.projected.z - a.projected.z);

    // Draw ground plane with shadows for depth perception
    const groundY = canvas.height * 0.85;
    const groundGradient = ctx.createLinearGradient(0, groundY - 50, 0, canvas.height);
    groundGradient.addColorStop(0, 'rgba(30, 25, 20, 0)');
    groundGradient.addColorStop(0.3, 'rgba(30, 25, 20, 0.3)');
    groundGradient.addColorStop(1, 'rgba(20, 15, 10, 0.5)');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY - 50, canvas.width, canvas.height - groundY + 50);

    // Draw projected shadows on ground plane
    transformedAtoms.forEach(atom => {
      const { projected, properties } = atom;
      const baseRadius = properties.radius * 25;
      const radius = Math.max(baseRadius * scale, 8);

      // Project shadow onto ground
      const shadowY = groundY;
      const shadowScale = 0.6;
      const shadowRadius = radius * shadowScale;
      const shadowOpacity = Math.max(0.1, 0.3 * (1 - (projected.y - groundY) / canvas.height));

      const shadowGradient = ctx.createRadialGradient(
        projected.x, shadowY, 0,
        projected.x, shadowY, shadowRadius * 2
      );
      shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${shadowOpacity * 0.6})`);
      shadowGradient.addColorStop(0.5, `rgba(0, 0, 0, ${shadowOpacity * 0.3})`);
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.ellipse(projected.x, shadowY, shadowRadius * 1.5, shadowRadius * 0.5, 0, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw enhanced bonds with cylindrical appearance
    bonds.forEach(bond => {
      const atom1 = transformedAtoms[bond.i];
      const atom2 = transformedAtoms[bond.j];

      if (!atom1 || !atom2) return;

      const avgDepth = (atom1.projected.depthFactor + atom2.projected.depthFactor) / 2;
      const bondOpacity = depthFog ? Math.max(0.7, avgDepth) : 1;

      // Enhanced bond thickness
      const bondWidth = Math.max(5, 8 * scale);
      const doubleOffset = Math.max(5, 7 * scale);

      // Calculate bond angle for cylindrical gradient
      const dx = atom2.projected.x - atom1.projected.x;
      const dy = atom2.projected.y - atom1.projected.y;
      const bondLength = Math.sqrt(dx * dx + dy * dy);
      const perpX = -dy / bondLength * bondWidth;
      const perpY = dx / bondLength * bondWidth;

      // Create cylindrical gradient for metallic bond appearance
      const midX = (atom1.projected.x + atom2.projected.x) / 2;
      const midY = (atom1.projected.y + atom2.projected.y) / 2;

      const bondGradient = ctx.createLinearGradient(
        midX - perpX, midY - perpY,
        midX + perpX, midY + perpY
      );
      bondGradient.addColorStop(0, `rgba(100, 100, 100, ${bondOpacity * 0.6})`);
      bondGradient.addColorStop(0.3, `rgba(180, 180, 180, ${bondOpacity * 0.9})`);
      bondGradient.addColorStop(0.5, `rgba(220, 220, 220, ${bondOpacity})`);
      bondGradient.addColorStop(0.7, `rgba(180, 180, 180, ${bondOpacity * 0.9})`);
      bondGradient.addColorStop(1, `rgba(100, 100, 100, ${bondOpacity * 0.6})`);

      // Draw bond shadow
      ctx.strokeStyle = `rgba(0, 0, 0, ${bondOpacity * 0.4})`;
      ctx.lineWidth = bondWidth + 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(atom1.projected.x + 2, atom1.projected.y + 2);
      ctx.lineTo(atom2.projected.x + 2, atom2.projected.y + 2);
      ctx.stroke();

      // Draw main bond with metallic gradient
      ctx.strokeStyle = bondGradient;
      ctx.lineWidth = bondWidth;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(atom1.projected.x, atom1.projected.y);
      ctx.lineTo(atom2.projected.x, atom2.projected.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw specular highlight on bond
      const highlightGradient = ctx.createLinearGradient(
        atom1.projected.x, atom1.projected.y,
        atom2.projected.x, atom2.projected.y
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      highlightGradient.addColorStop(0.4, `rgba(255, 255, 255, ${bondOpacity * 0.4})`);
      highlightGradient.addColorStop(0.6, `rgba(255, 255, 255, ${bondOpacity * 0.4})`);
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = highlightGradient;
      ctx.lineWidth = bondWidth * 0.4;
      ctx.beginPath();
      ctx.moveTo(atom1.projected.x, atom1.projected.y);
      ctx.lineTo(atom2.projected.x, atom2.projected.y);
      ctx.stroke();

      // Draw multiple bonds (double/triple)
      if (bond.type === 'double' || bond.type === 'triple') {
        const offsetPerpX = -dy / bondLength * doubleOffset;
        const offsetPerpY = dx / bondLength * doubleOffset;

        // Second bond line
        ctx.strokeStyle = `rgba(0, 0, 0, ${bondOpacity * 0.4})`;
        ctx.lineWidth = bondWidth + 2;
        ctx.beginPath();
        ctx.moveTo(atom1.projected.x + offsetPerpX + 2, atom1.projected.y + offsetPerpY + 2);
        ctx.lineTo(atom2.projected.x + offsetPerpX + 2, atom2.projected.y + offsetPerpY + 2);
        ctx.stroke();

        ctx.strokeStyle = bondGradient;
        ctx.lineWidth = bondWidth * 0.8;
        ctx.beginPath();
        ctx.moveTo(atom1.projected.x + offsetPerpX, atom1.projected.y + offsetPerpY);
        ctx.lineTo(atom2.projected.x + offsetPerpX, atom2.projected.y + offsetPerpY);
        ctx.stroke();

        // Third bond line for triple bonds
        if (bond.type === 'triple') {
          ctx.strokeStyle = `rgba(0, 0, 0, ${bondOpacity * 0.4})`;
          ctx.lineWidth = bondWidth + 2;
          ctx.beginPath();
          ctx.moveTo(atom1.projected.x - offsetPerpX + 2, atom1.projected.y - offsetPerpY + 2);
          ctx.lineTo(atom2.projected.x - offsetPerpX + 2, atom2.projected.y - offsetPerpY + 2);
          ctx.stroke();

          ctx.strokeStyle = bondGradient;
          ctx.lineWidth = bondWidth * 0.8;
          ctx.beginPath();
          ctx.moveTo(atom1.projected.x - offsetPerpX, atom1.projected.y - offsetPerpY);
          ctx.lineTo(atom2.projected.x - offsetPerpX, atom2.projected.y - offsetPerpY);
          ctx.stroke();
        }
      }
    });

    // Draw atoms with metallic/glossy materials
    transformedAtoms.forEach((atom, index) => {
      const { projected, properties } = atom;
      const baseRadius = properties.radius * 25;

      // Apply depth-based size scaling
      const depthScale = depthFog ? projected.depthFactor : 1;
      const radius = Math.max(baseRadius * scale * depthScale, 10);

      // Ambient occlusion
      let occlusionFactor = 1;
      if (ambientOcclusion) {
        const nearbyAtoms = transformedAtoms.filter(other => {
          if (other === atom) return false;
          const dx = other.projected.x - projected.x;
          const dy = other.projected.y - projected.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist < radius * 3;
        }).length;
        occlusionFactor = Math.max(0.5, 1 - nearbyAtoms * 0.1);
      }

      const baseColor = properties.color;
      const opacity = depthFog ? projected.depthFactor : 1;

      // Draw ambient shadow around sphere
      const ambientShadow = ctx.createRadialGradient(
        projected.x, projected.y, radius * 0.8,
        projected.x, projected.y, radius * 1.6
      );
      ambientShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      ambientShadow.addColorStop(1, `rgba(0, 0, 0, ${0.4 * opacity * occlusionFactor})`);
      ctx.fillStyle = ambientShadow;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius * 1.6, 0, 2 * Math.PI);
      ctx.fill();

      // Main metallic sphere gradient (multi-layer for depth)
      const mainGradient = ctx.createRadialGradient(
        projected.x - radius * 0.25, projected.y - radius * 0.25, 0,
        projected.x, projected.y, radius * 1.3
      );

      // Metallic appearance with multiple color stops
      mainGradient.addColorStop(0, lightenColor(baseColor, 0.8 * occlusionFactor));
      mainGradient.addColorStop(0.2, lightenColor(baseColor, 0.5 * occlusionFactor));
      mainGradient.addColorStop(0.4, lightenColor(baseColor, 0.2 * occlusionFactor));
      mainGradient.addColorStop(0.6, baseColor);
      mainGradient.addColorStop(0.85, darkenColor(baseColor, 0.3));
      mainGradient.addColorStop(1, darkenColor(baseColor, 0.6 * (1 - occlusionFactor)));

      // Draw main sphere
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = mainGradient;
      ctx.fill();

      // Rim lighting effect (light from behind)
      const rimGradient = ctx.createRadialGradient(
        projected.x + radius * 0.4, projected.y + radius * 0.4, 0,
        projected.x + radius * 0.4, projected.y + radius * 0.4, radius * 0.8
      );
      rimGradient.addColorStop(0, `rgba(255, 255, 255, ${0.15 * opacity})`);
      rimGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = rimGradient;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Primary specular highlight (main light source)
      const specular1 = ctx.createRadialGradient(
        projected.x - radius * 0.35, projected.y - radius * 0.35, 0,
        projected.x - radius * 0.35, projected.y - radius * 0.35, radius * 0.35
      );
      specular1.addColorStop(0, `rgba(255, 255, 255, ${0.9 * opacity})`);
      specular1.addColorStop(0.5, `rgba(255, 255, 255, ${0.5 * opacity})`);
      specular1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specular1;
      ctx.beginPath();
      ctx.arc(projected.x - radius * 0.35, projected.y - radius * 0.35, radius * 0.35, 0, 2 * Math.PI);
      ctx.fill();

      // Secondary specular highlight (smaller, brighter)
      ctx.beginPath();
      ctx.arc(projected.x - radius * 0.3, projected.y - radius * 0.3, radius * 0.15, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * opacity})`;
      ctx.fill();

      // Tertiary highlight for extra glossiness
      const specular3 = ctx.createRadialGradient(
        projected.x - radius * 0.45, projected.y - radius * 0.2, 0,
        projected.x - radius * 0.45, projected.y - radius * 0.2, radius * 0.2
      );
      specular3.addColorStop(0, `rgba(255, 255, 255, ${0.4 * opacity})`);
      specular3.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specular3;
      ctx.beginPath();
      ctx.arc(projected.x - radius * 0.45, projected.y - radius * 0.2, radius * 0.2, 0, 2 * Math.PI);
      ctx.fill();

      // Subtle edge darkening for definition
      ctx.strokeStyle = darkenColor(baseColor, 0.7);
      ctx.lineWidth = Math.max(1.5, radius * 0.08);
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Hover effect
      if (hoveredAtom === index) {
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, radius + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Atom labels
      if (showLabels) {
        ctx.font = `bold ${Math.max(12, radius * 0.5)}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(atom.symbol, projected.x, projected.y);
        ctx.fillText(atom.symbol, projected.x, projected.y);
      }
    });

    // Draw FPS counter
    if (showFPS) {
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = fps > 50 ? '#00ff88' : fps > 30 ? '#ffb84d' : '#ff4757';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'left';
      ctx.strokeText(`${fps} FPS`, 10, 20);
      ctx.fillText(`${fps} FPS`, 10, 20);
    }
  }, [atomData, hoveredAtom, project3DTo2D, transformAtom, scale, bonds,
    depthFog, ambientOcclusion, showLabels, showFPS, fps, drawQuantumGrid, drawVertexSphere]);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x,
        y: prev.y + 0.01,
        z: prev.z
      }));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Animation loop with FPS tracking
  useEffect(() => {
    const animate = () => {
      drawMolecule();

      // Calculate FPS
      const now = Date.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (delta > 0) {
        const currentFps = Math.round(1000 / delta);
        fpsHistoryRef.current.push(currentFps);
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }
        const avgFps = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        );
        setFPS(avgFps);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawMolecule]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      if (e.shiftKey) {
        setOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      } else {
        setRotation(prev => ({
          x: prev.x + deltaY * 0.01,
          y: prev.y + deltaX * 0.01,
          z: prev.z
        }));
      }

      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else {
      // Check for atom hover
      let hoveredIndex = null;
      if (atomData && Array.isArray(atomData) && atomData.length > 0) {
        try {
          // Get current transformed atoms for hover detection
          const currentTransformedAtoms = atomData.map(atom => {
            const transformed = transformAtom(atom);
            const projected = project3DTo2D(transformed);
            return {
              ...atom,
              transformed,
              projected,
              properties: atomProperties[atom.symbol] || atomProperties.C
            };
          });

          currentTransformedAtoms.forEach((atom, i) => {
            if (atom && atom.projected && typeof atom.projected.x === 'number' && typeof atom.projected.y === 'number') {
              const distance = Math.sqrt(
                Math.pow(mouseX - atom.projected.x, 2) +
                Math.pow(mouseY - atom.projected.y, 2)
              );
              const radius = atom.properties.radius * 25 * scale * (depthFog ? (atom.projected.depthFactor || 1) : 1);

              if (distance < radius) {
                hoveredIndex = i;
              }
            }
          });
        } catch (error) {
          console.warn('Error in hover detection:', error);
        }
      }
      setHoveredAtom(hoveredIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.92 : 1.08;
    setScale(prev => {
      const newScale = Math.max(0.3, Math.min(3, prev * scaleFactor));
      if (newScale < 0.5) {
        setOffset({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      // CRITICAL: Ignore keyboard shortcuts when user is typing in input fields or textareas
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );

      // If user is typing, don't handle shortcuts
      if (isTyping) {
        console.log('Keyboard shortcut blocked - user is typing in:', activeElement.tagName);
        return;
      }

      const rotSpeed = 0.1;
      const zoomSpeed = 0.1;

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          setRotation(prev => ({ ...prev, y: prev.y - rotSpeed }));
          break;
        case 'arrowright':
          setRotation(prev => ({ ...prev, y: prev.y + rotSpeed }));
          break;
        case 'arrowup':
          setRotation(prev => ({ ...prev, x: prev.x - rotSpeed }));
          break;
        case 'arrowdown':
          setRotation(prev => ({ ...prev, x: prev.x + rotSpeed }));
          break;
        case '+':
        case '=':
          setScale(prev => Math.min(3, prev + zoomSpeed));
          break;
        case '-':
        case '_':
          setScale(prev => Math.max(0.3, prev - zoomSpeed));
          break;
        case 'r':
          resetView();
          break;
        case 'a':
          setAutoRotate(prev => !prev);
          break;
        case 'l':
          setShowLabels(prev => !prev);
          break;
        case 'f':
          setShowFPS(prev => !prev);
          break;
        case 'd':
          setDepthFog(prev => !prev);
          break;
        case 'o':
          setAmbientOcclusion(prev => !prev);
          break;
        case 'g':
          setShowQuantumGrid(prev => !prev);
          break;
        case 'v':
          setShowVertexSphere(prev => !prev);
          break;
        case 'q':
          // Toggle quantum mode (both grid and vertex sphere)
          setShowQuantumGrid(prev => {
            const newValue = !prev;
            setShowVertexSphere(newValue);
            return newValue;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Reset view function
  const resetView = useCallback(() => {
    setRotation({ x: 0.3, y: 0.3, z: 0 });
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setAutoRotate(false);
  }, []);

  // Screenshot function
  const takeScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `molecule-${selectedMolecule}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [selectedMolecule]);

  // Handle canvas resize without disturbing the view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // Store current dimensions
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

      // Get new dimensions
      const newWidth = parent.offsetWidth;
      const newHeight = parent.offsetHeight;

      // Only resize if dimensions actually changed
      if (oldWidth !== newWidth || oldHeight !== newHeight) {
        // Calculate offset adjustment to keep molecule centered
        const widthDiff = (newWidth - oldWidth) / 2;
        const heightDiff = (newHeight - oldHeight) / 2;

        // Adjust offset to compensate for size change (keeps molecule in same visual position)
        setOffset(prev => ({
          x: prev.x + widthDiff,
          y: prev.y + heightDiff
        }));

        canvas.width = newWidth;
        canvas.height = newHeight;
      }
    };

    // Initial size
    resizeCanvas();

    // Use ResizeObserver for better resize detection
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Fallback to window resize event
    window.addEventListener('resize', resizeCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Set up global functions
  useEffect(() => {
    window.resetMoleculeView = resetView;
    window.takeScreenshot = takeScreenshot;

    return () => {
      delete window.resetMoleculeView;
      delete window.takeScreenshot;
    };
  }, [resetView, takeScreenshot]);

  return (
    <div className="interactive-3d-molecule">
      <canvas
        ref={canvasRef}
        className="molecule-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />

      {/* Atom tooltip */}
      {hoveredAtom !== null && atomData && (
        <div
          className="atom-tooltip"
          style={{
            position: 'fixed',
            left: mousePos.x + 10,
            top: mousePos.y - 30,
            pointerEvents: 'none'
          }}
        >
          <div className="tooltip-content">
            <strong>{atomData[hoveredAtom].symbol}</strong>
            <br />
            {atomProperties[atomData[hoveredAtom].symbol]?.name || 'Unknown'}
            <br />
            <small>
              Position: ({atomData[hoveredAtom].x.toFixed(2)}, {atomData[hoveredAtom].y.toFixed(2)}, {atomData[hoveredAtom].z.toFixed(2)})
            </small>
          </div>
        </div>
      )}

      {/* Enhanced controls hint */}
      <div className="controls-hint">
        <small>
          {autoRotate && <span style={{ color: '#00ff00' }}>↻ Auto-rotating • </span>}
          {showQuantumGrid && <span style={{ color: '#00ffff' }}>▦ Quantum Grid • </span>}
          {showVertexSphere && '⚛️ Vertex Field • '}
          Drag: rotate • Shift+Drag: pan • Scroll: zoom • Arrows: rotate • +/-: zoom • R: reset • A: auto-rotate • L: labels • F: FPS • G: grid • V: vertices • Q: quantum mode
        </small>
      </div>
    </div>
  );
};

export default Interactive3DMolecule;