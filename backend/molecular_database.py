# molecular_database.py - Molecular Database Management System
# Rwanda Quantum Agricultural Intelligence Platform
# Enhanced molecular file handling and sub-atomic material design

import sqlite3
import json
import hashlib
import os
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from pathlib import Path
import logging

# Import simulation core functions
from simulation_core import (
    parse_molecule_string, 
    molecule_to_string,
    calculate_molecular_descriptors,
    predict_agricultural_activity,
    run_molecule_simulation
)

logger = logging.getLogger(__name__)

class MolecularDatabase:
    """Advanced molecular database for handling molecule files and sub-atomic design"""
    
    def __init__(self, db_path: str = "molecular_database.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the molecular database with comprehensive schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Main molecules table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS molecules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                formula TEXT,
                molecule_string TEXT NOT NULL,
                file_hash TEXT UNIQUE,
                file_format TEXT,
                source_file_name TEXT,
                molecular_weight REAL,
                num_atoms INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                category TEXT DEFAULT 'general',
                description TEXT,
                metadata TEXT
            )
        ''')
        
        # Atomic properties table for sub-atomic level design
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS atomic_properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                molecule_id INTEGER,
                atom_index INTEGER,
                element_symbol TEXT NOT NULL,
                x_coord REAL NOT NULL,
                y_coord REAL NOT NULL,
                z_coord REAL NOT NULL,
                partial_charge REAL DEFAULT 0.0,
                bond_order_sum REAL DEFAULT 0.0,
                hybridization TEXT,
                formal_charge INTEGER DEFAULT 0,
                is_aromatic BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (molecule_id) REFERENCES molecules (id)
            )
        ''')
        
        # Bonds table for molecular connectivity
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS molecular_bonds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                molecule_id INTEGER,
                atom1_index INTEGER,
                atom2_index INTEGER,
                bond_type TEXT DEFAULT 'single',
                bond_order REAL DEFAULT 1.0,
                bond_length REAL,
                FOREIGN KEY (molecule_id) REFERENCES molecules (id)
            )
        ''')
        
        # Simulation results cache
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS simulation_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                molecule_id INTEGER,
                method TEXT NOT NULL,
                energy REAL,
                dipole_moment_x REAL,
                dipole_moment_y REAL,
                dipole_moment_z REAL,
                vibrational_frequencies TEXT,
                agricultural_activity TEXT,
                computation_time_ms REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (molecule_id) REFERENCES molecules (id)
            )
        ''')
        
        # Material properties for sub-atomic design
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS material_properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                molecule_id INTEGER,
                tensile_strength REAL,
                flexibility_score REAL,
                biodegradability_score REAL,
                uv_resistance REAL,
                water_resistance REAL,
                thermal_stability REAL,
                cost_estimate REAL,
                environmental_impact REAL,
                rwanda_suitability TEXT,
                applications TEXT,
                FOREIGN KEY (molecule_id) REFERENCES molecules (id)
            )
        ''')
        
        # Molecular fragments for sub-atomic building blocks
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS molecular_fragments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                smiles TEXT,
                fragment_string TEXT NOT NULL,
                fragment_type TEXT,
                functional_group TEXT,
                reactivity_score REAL,
                stability_score REAL,
                agricultural_relevance TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Molecular database initialized successfully")
    
    def add_molecule_from_file(self, file_path: str, name: str = None, category: str = "general", 
                              description: str = None) -> int:
        """Add molecule from various file formats (SDF, MOL, XYZ, PDB)"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Molecule file not found: {file_path}")
        
        file_format = Path(file_path).suffix.lower()
        file_name = Path(file_path).name
        
        # Read and parse file content
        with open(file_path, 'r') as f:
            file_content = f.read()
        
        # Generate file hash for uniqueness
        file_hash = hashlib.md5(file_content.encode()).hexdigest()
        
        # Parse molecule based on format
        molecule_string = self._parse_molecule_file(file_content, file_format)
        
        if not molecule_string:
            raise ValueError(f"Could not parse molecule file: {file_path}")
        
        # Calculate molecular properties
        atom_data = parse_molecule_string(molecule_string)
        descriptors = calculate_molecular_descriptors(atom_data)
        
        # Use filename as name if not provided
        if not name:
            name = Path(file_path).stem
        
        return self.add_molecule(
            name=name,
            molecule_string=molecule_string,
            category=category,
            description=description,
            file_hash=file_hash,
            file_format=file_format,
            source_file_name=file_name,
            molecular_weight=descriptors.get('molecular_weight', 0),
            num_atoms=descriptors.get('num_atoms', 0)
        )
    
    def _parse_molecule_file(self, content: str, file_format: str) -> str:
        """Parse different molecular file formats to internal format"""
        try:
            if file_format in ['.xyz']:
                return self._parse_xyz(content)
            elif file_format in ['.mol', '.sdf']:
                return self._parse_mol_sdf(content)
            elif file_format in ['.pdb']:
                return self._parse_pdb(content)
            else:
                # Try to parse as direct molecule string format
                return content.strip()
        except Exception as e:
            logger.error(f"Error parsing {file_format} file: {e}")
            return None
    
    def _parse_xyz(self, content: str) -> str:
        """Parse XYZ format to molecule string"""
        lines = content.strip().split('\n')
        if len(lines) < 2:
            return None
        
        try:
            num_atoms = int(lines[0])
            # Skip comment line
            atom_lines = lines[2:2+num_atoms]
            
            atoms = []
            for line in atom_lines:
                parts = line.strip().split()
                if len(parts) >= 4:
                    symbol = parts[0]
                    x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
                    atoms.append(f"{symbol} {x} {y} {z}")
            
            return "; ".join(atoms)
        except (ValueError, IndexError) as e:
            logger.error(f"Error parsing XYZ content: {e}")
            return None
    
    def _parse_mol_sdf(self, content: str) -> str:
        """Parse MOL/SDF format to molecule string"""
        lines = content.strip().split('\n')
        if len(lines) < 4:
            return None
        
        try:
            # MOL format: line 4 contains atom and bond counts
            counts_line = lines[3].strip()
            num_atoms = int(counts_line[:3])
            
            atoms = []
            # Atom block starts at line 4 (index 4)
            for i in range(4, 4 + num_atoms):
                if i >= len(lines):
                    break
                parts = lines[i].strip().split()
                if len(parts) >= 4:
                    x, y, z = float(parts[0]), float(parts[1]), float(parts[2])
                    symbol = parts[3]
                    atoms.append(f"{symbol} {x} {y} {z}")
            
            return "; ".join(atoms)
        except (ValueError, IndexError) as e:
            logger.error(f"Error parsing MOL/SDF content: {e}")
            return None
    
    def _parse_pdb(self, content: str) -> str:
        """Parse PDB format to molecule string (ATOM records only)"""
        lines = content.strip().split('\n')
        atoms = []
        
        for line in lines:
            if line.startswith('ATOM') or line.startswith('HETATM'):
                try:
                    # PDB format positions
                    symbol = line[76:78].strip() or line[12:16].strip()[0]
                    x = float(line[30:38])
                    y = float(line[38:46])
                    z = float(line[46:54])
                    atoms.append(f"{symbol} {x} {y} {z}")
                except (ValueError, IndexError):
                    continue
        
        return "; ".join(atoms) if atoms else None
    
    def add_molecule(self, name: str, molecule_string: str, category: str = "general",
                    description: str = None, **kwargs) -> int:
        """Add molecule to database with full atomic detail storage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Parse molecule and calculate properties
            atom_data = parse_molecule_string(molecule_string)
            descriptors = calculate_molecular_descriptors(atom_data)
            
            # Insert main molecule record
            cursor.execute('''
                INSERT INTO molecules (name, molecule_string, category, description, 
                                     molecular_weight, num_atoms, file_hash, file_format, 
                                     source_file_name, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                name, molecule_string, category, description,
                descriptors.get('molecular_weight', 0),
                descriptors.get('num_atoms', 0),
                kwargs.get('file_hash'),
                kwargs.get('file_format'),
                kwargs.get('source_file_name'),
                json.dumps(kwargs)
            ))
            
            molecule_id = cursor.lastrowid
            
            # Store atomic properties for sub-atomic level design
            for i, atom in enumerate(atom_data):
                cursor.execute('''
                    INSERT INTO atomic_properties (molecule_id, atom_index, element_symbol,
                                                 x_coord, y_coord, z_coord, partial_charge)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    molecule_id, i, atom['symbol'],
                    atom['x'], atom['y'], atom['z'],
                    atom.get('charge', 0.0)
                ))
            
            # Calculate and store bonds
            self._calculate_and_store_bonds(cursor, molecule_id, atom_data)
            
            conn.commit()
            logger.info(f"Added molecule '{name}' with ID {molecule_id}")
            return molecule_id
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error adding molecule: {e}")
            raise
        finally:
            conn.close()
    
    def _calculate_and_store_bonds(self, cursor, molecule_id: int, atom_data: List[Dict]):
        """Calculate and store molecular bonds based on distance"""
        # Bond distance thresholds (in Angstroms)
        bond_thresholds = {
            ('H', 'H'): 1.0, ('H', 'C'): 1.2, ('H', 'N'): 1.2, ('H', 'O'): 1.2,
            ('C', 'C'): 1.8, ('C', 'N'): 1.8, ('C', 'O'): 1.8,
            ('N', 'N'): 1.6, ('N', 'O'): 1.6, ('O', 'O'): 1.6
        }
        
        for i in range(len(atom_data)):
            for j in range(i + 1, len(atom_data)):
                atom1, atom2 = atom_data[i], atom_data[j]
                
                # Calculate distance
                distance = np.sqrt(
                    (atom1['x'] - atom2['x'])**2 +
                    (atom1['y'] - atom2['y'])**2 +
                    (atom1['z'] - atom2['z'])**2
                )
                
                # Check if atoms are bonded
                symbols = tuple(sorted([atom1['symbol'], atom2['symbol']]))
                threshold = bond_thresholds.get(symbols, 2.0)
                
                if distance <= threshold:
                    # Determine bond type based on distance
                    bond_type = 'single'
                    bond_order = 1.0
                    
                    if distance < threshold * 0.8:
                        bond_type = 'double'
                        bond_order = 2.0
                    elif distance < threshold * 0.7:
                        bond_type = 'triple'
                        bond_order = 3.0
                    
                    cursor.execute('''
                        INSERT INTO molecular_bonds (molecule_id, atom1_index, atom2_index,
                                                   bond_type, bond_order, bond_length)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (molecule_id, i, j, bond_type, bond_order, distance))
    
    def get_molecule(self, molecule_id: int) -> Dict[str, Any]:
        """Get complete molecule data including atomic details"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get main molecule data
        cursor.execute('SELECT * FROM molecules WHERE id = ?', (molecule_id,))
        molecule_row = cursor.fetchone()
        
        if not molecule_row:
            conn.close()
            return None
        
        # Convert to dict
        columns = [desc[0] for desc in cursor.description]
        molecule = dict(zip(columns, molecule_row))
        
        # Get atomic properties
        cursor.execute('''
            SELECT * FROM atomic_properties WHERE molecule_id = ? ORDER BY atom_index
        ''', (molecule_id,))
        atomic_data = cursor.fetchall()
        
        # Get bonds
        cursor.execute('''
            SELECT * FROM molecular_bonds WHERE molecule_id = ?
        ''', (molecule_id,))
        bonds_data = cursor.fetchall()
        
        # Get simulation results
        cursor.execute('''
            SELECT * FROM simulation_results WHERE molecule_id = ? 
            ORDER BY created_at DESC LIMIT 1
        ''', (molecule_id,))
        simulation_data = cursor.fetchone()
        
        # Get material properties
        cursor.execute('''
            SELECT * FROM material_properties WHERE molecule_id = ?
        ''', (molecule_id,))
        material_data = cursor.fetchone()
        
        conn.close()
        
        # Structure the response
        molecule['atomic_properties'] = [dict(zip([desc[0] for desc in cursor.description], row)) 
                                       for row in atomic_data] if atomic_data else []
        molecule['bonds'] = [dict(zip([desc[0] for desc in cursor.description], row)) 
                           for row in bonds_data] if bonds_data else []
        molecule['latest_simulation'] = dict(zip([desc[0] for desc in cursor.description], simulation_data)) if simulation_data else None
        molecule['material_properties'] = dict(zip([desc[0] for desc in cursor.description], material_data)) if material_data else None
        
        return molecule
    
    def search_molecules(self, query: str = None, category: str = None, 
                        min_atoms: int = None, max_atoms: int = None) -> List[Dict]:
        """Search molecules with various filters"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = "SELECT * FROM molecules WHERE 1=1"
        params = []
        
        if query:
            sql += " AND (name LIKE ? OR description LIKE ?)"
            params.extend([f"%{query}%", f"%{query}%"])
        
        if category:
            sql += " AND category = ?"
            params.append(category)
        
        if min_atoms:
            sql += " AND num_atoms >= ?"
            params.append(min_atoms)
        
        if max_atoms:
            sql += " AND num_atoms <= ?"
            params.append(max_atoms)
        
        sql += " ORDER BY created_at DESC"
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        columns = [desc[0] for desc in cursor.description]
        molecules = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return molecules
    
    def run_and_cache_simulation(self, molecule_id: int, method: str = "hf") -> Dict[str, Any]:
        """Run simulation and cache results"""
        molecule = self.get_molecule(molecule_id)
        if not molecule:
            raise ValueError(f"Molecule with ID {molecule_id} not found")
        
        # Run simulation
        from simulation_core import run_molecule_simulation
        result = run_molecule_simulation(molecule['molecule_string'], method)
        
        if result['success']:
            # Cache simulation results
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            dipole = result.get('dipole_moment', [0, 0, 0])
            
            cursor.execute('''
                INSERT INTO simulation_results (molecule_id, method, energy, 
                                              dipole_moment_x, dipole_moment_y, dipole_moment_z,
                                              vibrational_frequencies, agricultural_activity, 
                                              computation_time_ms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                molecule_id, method, result.get('classical_energy'),
                dipole[0], dipole[1], dipole[2],
                json.dumps(result.get('vibrational_frequencies', [])),
                json.dumps(result.get('agricultural_activity', {})),
                result.get('computation_time_ms')
            ))
            
            conn.commit()
            conn.close()
        
        return result
    
    def design_sub_atomic_material(self, base_molecule_id: int, target_properties: Dict[str, Any]) -> Dict[str, Any]:
        """Design materials at sub-atomic level by modifying molecular structure"""
        molecule = self.get_molecule(base_molecule_id)
        if not molecule:
            raise ValueError(f"Base molecule with ID {base_molecule_id} not found")
        
        # Get atomic properties for manipulation
        atoms = molecule['atomic_properties']
        bonds = molecule['bonds']
        
        # Sub-atomic level modifications based on target properties
        modified_atoms = self._optimize_atomic_structure(atoms, bonds, target_properties)
        
        # Create new molecule string from modified atoms
        modified_molecule_string = "; ".join([
            f"{atom['element_symbol']} {atom['x_coord']} {atom['y_coord']} {atom['z_coord']}"
            for atom in modified_atoms
        ])
        
        # Run simulation on modified structure
        from simulation_core import run_molecule_simulation, predict_material_properties
        
        sim_result = run_molecule_simulation(modified_molecule_string, method="hf")
        material_result = predict_material_properties(modified_molecule_string, num_repeats=3)
        
        # Store the designed material
        new_molecule_id = self.add_molecule(
            name=f"Designed_{molecule['name']}_v{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            molecule_string=modified_molecule_string,
            category="designed_material",
            description=f"Sub-atomic designed material based on {molecule['name']} for {target_properties}"
        )
        
        # Store material properties
        if material_result['success']:
            self._store_material_properties(new_molecule_id, material_result, target_properties)
        
        return {
            "success": True,
            "original_molecule_id": base_molecule_id,
            "designed_molecule_id": new_molecule_id,
            "modified_structure": modified_molecule_string,
            "simulation_result": sim_result,
            "material_properties": material_result,
            "design_parameters": target_properties
        }
    
    def _optimize_atomic_structure(self, atoms: List[Dict], bonds: List[Dict], 
                                  target_properties: Dict[str, Any]) -> List[Dict]:
        """Optimize atomic positions and properties for target material characteristics"""
        modified_atoms = atoms.copy()
        
        # Sub-atomic level optimizations
        for i, atom in enumerate(modified_atoms):
            # Adjust positions based on target properties
            if target_properties.get('flexibility', 0) > 0.7:
                # Increase bond lengths slightly for flexibility
                atom['x_coord'] *= 1.05
                atom['y_coord'] *= 1.05
            
            if target_properties.get('strength', 0) > 0.8:
                # Optimize for stronger bonding
                if atom['element_symbol'] == 'C':
                    # Add slight compression for stronger C-C bonds
                    atom['x_coord'] *= 0.98
                    atom['y_coord'] *= 0.98
            
            if target_properties.get('biodegradability', 0) > 0.6:
                # Add oxygen atoms for better biodegradation
                if i % 3 == 0 and atom['element_symbol'] == 'C':
                    # Occasionally replace C with O for biodegradability
                    if np.random.random() < 0.1:
                        atom['element_symbol'] = 'O'
        
        return modified_atoms
    
    def _store_material_properties(self, molecule_id: int, material_result: Dict, 
                                  target_properties: Dict):
        """Store calculated material properties"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO material_properties (
                molecule_id, tensile_strength, flexibility_score, biodegradability_score,
                uv_resistance, water_resistance, thermal_stability, cost_estimate,
                environmental_impact, rwanda_suitability, applications
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            molecule_id,
            material_result.get('tensile_strength_mpa', 0),
            material_result.get('flexibility_score', 0),
            material_result.get('biodegradability_score', 0),
            material_result.get('uv_stability_score', 0),
            material_result.get('water_resistance_score', 0),
            85.0,  # Default thermal stability
            material_result.get('estimated_cost_usd_per_kg', 0),
            material_result.get('carbon_footprint_score', 0),
            json.dumps(target_properties),
            json.dumps(material_result.get('rwanda_applications', []))
        ))
        
        conn.commit()
        conn.close()
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # Count molecules by category
        cursor.execute('SELECT category, COUNT(*) FROM molecules GROUP BY category')
        stats['molecules_by_category'] = dict(cursor.fetchall())
        
        # Total molecules
        cursor.execute('SELECT COUNT(*) FROM molecules')
        stats['total_molecules'] = cursor.fetchone()[0]
        
        # Total simulations
        cursor.execute('SELECT COUNT(*) FROM simulation_results')
        stats['total_simulations'] = cursor.fetchone()[0]
        
        # Average molecular weight
        cursor.execute('SELECT AVG(molecular_weight) FROM molecules WHERE molecular_weight > 0')
        result = cursor.fetchone()[0]
        stats['avg_molecular_weight'] = result if result else 0
        
        conn.close()
        return stats

# Global database instance
molecular_db = MolecularDatabase()
