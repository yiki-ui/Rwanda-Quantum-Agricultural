# sub_atomic_designer.py - Sub-Atomic Level Material Designer
# Rwanda Quantum Agricultural Intelligence Platform
# Advanced material design at the atomic and sub-atomic level

import numpy as np
import json
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import logging
from dataclasses import dataclass

from simulation_core import (
    parse_molecule_string,
    molecule_to_string,
    run_molecule_simulation,
    predict_material_properties,
    calculate_molecular_descriptors
)

logger = logging.getLogger(__name__)

@dataclass
class AtomicModification:
    """Represents an atomic-level modification"""
    atom_index: int
    modification_type: str  # 'substitute', 'move', 'add_bond', 'remove_bond'
    parameters: Dict[str, Any]
    expected_effect: str

@dataclass
class MaterialTarget:
    """Target properties for material design"""
    strength: float = 0.5  # 0-1 scale
    flexibility: float = 0.5
    biodegradability: float = 0.5
    uv_resistance: float = 0.5
    water_resistance: float = 0.5
    cost_effectiveness: float = 0.5
    environmental_safety: float = 0.8
    agricultural_suitability: float = 0.7

class SubAtomicDesigner:
    """Advanced sub-atomic level material designer for agricultural applications"""
    
    def __init__(self):
        self.atomic_properties = self._load_atomic_properties()
        self.functional_groups = self._load_functional_groups()
        self.design_rules = self._load_design_rules()
    
    def _load_atomic_properties(self) -> Dict[str, Dict]:
        """Load atomic properties database"""
        return {
            'H': {'radius': 0.31, 'electronegativity': 2.20, 'valence': 1, 'mass': 1.008},
            'C': {'radius': 0.76, 'electronegativity': 2.55, 'valence': 4, 'mass': 12.011},
            'N': {'radius': 0.71, 'electronegativity': 3.04, 'valence': 3, 'mass': 14.007},
            'O': {'radius': 0.66, 'electronegativity': 3.44, 'valence': 2, 'mass': 15.999},
            'P': {'radius': 1.07, 'electronegativity': 2.19, 'valence': 5, 'mass': 30.974},
            'S': {'radius': 1.05, 'electronegativity': 2.58, 'valence': 6, 'mass': 32.065},
            'Cl': {'radius': 0.99, 'electronegativity': 3.16, 'valence': 1, 'mass': 35.453},
            'F': {'radius': 0.57, 'electronegativity': 3.98, 'valence': 1, 'mass': 18.998},
            'Si': {'radius': 1.11, 'electronegativity': 1.90, 'valence': 4, 'mass': 28.085},
            'Ca': {'radius': 1.74, 'electronegativity': 1.00, 'valence': 2, 'mass': 40.078},
            'Fe': {'radius': 1.26, 'electronegativity': 1.83, 'valence': 3, 'mass': 55.845},
            'Zn': {'radius': 1.22, 'electronegativity': 1.65, 'valence': 2, 'mass': 65.38}
        }
    
    def _load_functional_groups(self) -> Dict[str, Dict]:
        """Load functional groups that affect material properties"""
        return {
            'hydroxyl': {
                'structure': 'O-H',
                'effect_on_biodegradability': +0.3,
                'effect_on_water_resistance': -0.2,
                'effect_on_flexibility': +0.1
            },
            'carboxyl': {
                'structure': 'C(=O)OH',
                'effect_on_biodegradability': +0.4,
                'effect_on_strength': -0.1,
                'effect_on_water_resistance': -0.3
            },
            'ester': {
                'structure': 'C(=O)O-C',
                'effect_on_biodegradability': +0.2,
                'effect_on_flexibility': +0.2,
                'effect_on_uv_resistance': +0.1
            },
            'amide': {
                'structure': 'C(=O)N',
                'effect_on_strength': +0.3,
                'effect_on_biodegradability': +0.1,
                'effect_on_flexibility': -0.1
            },
            'aromatic': {
                'structure': 'benzene_ring',
                'effect_on_strength': +0.4,
                'effect_on_uv_resistance': +0.5,
                'effect_on_biodegradability': -0.3
            },
            'siloxane': {
                'structure': 'Si-O-Si',
                'effect_on_flexibility': +0.4,
                'effect_on_water_resistance': +0.6,
                'effect_on_uv_resistance': +0.3
            }
        }
    
    def _load_design_rules(self) -> Dict[str, List[str]]:
        """Load design rules for different material properties"""
        return {
            'increase_strength': [
                'add_aromatic_rings',
                'increase_crosslinking',
                'add_amide_groups',
                'optimize_crystallinity'
            ],
            'increase_flexibility': [
                'add_siloxane_chains',
                'increase_chain_length',
                'add_ester_linkages',
                'reduce_crosslinking'
            ],
            'increase_biodegradability': [
                'add_hydroxyl_groups',
                'add_carboxyl_groups',
                'add_ester_bonds',
                'reduce_aromatic_content'
            ],
            'increase_uv_resistance': [
                'add_aromatic_rings',
                'add_siloxane_groups',
                'add_uv_stabilizers',
                'optimize_conjugation'
            ],
            'increase_water_resistance': [
                'add_siloxane_groups',
                'increase_hydrophobic_content',
                'reduce_polar_groups',
                'add_fluorinated_groups'
            ]
        }
    
    def design_material(self, base_molecule_string: str, target: MaterialTarget, 
                       max_iterations: int = 10) -> Dict[str, Any]:
        """Design material at sub-atomic level to meet target properties"""
        logger.info(f"Starting sub-atomic material design with target: {target}")
        
        current_molecule = base_molecule_string
        design_history = []
        best_score = 0
        best_molecule = current_molecule
        
        for iteration in range(max_iterations):
            logger.info(f"Design iteration {iteration + 1}/{max_iterations}")
            
            # Analyze current molecule
            analysis = self._analyze_molecule_properties(current_molecule)
            
            # Calculate fitness score
            fitness_score = self._calculate_fitness(analysis, target)
            
            if fitness_score > best_score:
                best_score = fitness_score
                best_molecule = current_molecule
            
            # Generate modifications
            modifications = self._generate_modifications(current_molecule, analysis, target)
            
            if not modifications:
                logger.info("No more beneficial modifications found")
                break
            
            # Apply best modification
            best_modification = max(modifications, key=lambda m: m['expected_improvement'])
            current_molecule = self._apply_modification(current_molecule, best_modification)
            
            design_history.append({
                'iteration': iteration + 1,
                'modification': best_modification,
                'fitness_score': fitness_score,
                'molecule_string': current_molecule
            })
        
        # Final analysis and simulation
        final_analysis = self._analyze_molecule_properties(best_molecule)
        simulation_result = run_molecule_simulation(best_molecule, method="hf")
        material_properties = predict_material_properties(best_molecule, num_repeats=3)
        
        return {
            'success': True,
            'original_molecule': base_molecule_string,
            'designed_molecule': best_molecule,
            'target_properties': target.__dict__,
            'achieved_properties': final_analysis,
            'fitness_score': best_score,
            'design_iterations': len(design_history),
            'design_history': design_history,
            'simulation_result': simulation_result,
            'material_properties': material_properties,
            'design_recommendations': self._generate_recommendations(final_analysis, target)
        }
    
    def _analyze_molecule_properties(self, molecule_string: str) -> Dict[str, float]:
        """Analyze molecular properties relevant to material design"""
        try:
            atom_data = parse_molecule_string(molecule_string)
            descriptors = calculate_molecular_descriptors(atom_data)
            
            # Calculate property estimates based on molecular structure
            properties = {}
            
            # Strength estimation (based on aromatic content and crosslinking)
            aromatic_atoms = sum(1 for atom in atom_data if atom['symbol'] == 'C')
            total_atoms = len(atom_data)
            aromatic_ratio = aromatic_atoms / total_atoms if total_atoms > 0 else 0
            properties['strength'] = min(1.0, aromatic_ratio * 2 + 0.3)
            
            # Flexibility estimation (based on chain length and ester content)
            chain_length_factor = min(1.0, total_atoms / 20)
            oxygen_ratio = sum(1 for atom in atom_data if atom['symbol'] == 'O') / total_atoms if total_atoms > 0 else 0
            properties['flexibility'] = min(1.0, chain_length_factor * 0.7 + oxygen_ratio * 0.5)
            
            # Biodegradability (based on oxygen and nitrogen content)
            biodegradable_atoms = sum(1 for atom in atom_data if atom['symbol'] in ['O', 'N'])
            properties['biodegradability'] = min(1.0, biodegradable_atoms / total_atoms * 3)
            
            # UV resistance (based on aromatic content and conjugation)
            properties['uv_resistance'] = min(1.0, aromatic_ratio * 1.5 + 0.2)
            
            # Water resistance (based on hydrophobic content)
            hydrophobic_atoms = sum(1 for atom in atom_data if atom['symbol'] in ['C', 'Si', 'F'])
            properties['water_resistance'] = min(1.0, hydrophobic_atoms / total_atoms * 1.2)
            
            # Cost effectiveness (inverse of molecular complexity)
            complexity = len(set(atom['symbol'] for atom in atom_data))
            properties['cost_effectiveness'] = max(0.1, 1.0 - complexity / 10)
            
            # Environmental safety (based on toxic element content)
            toxic_elements = ['Cl', 'Br', 'I', 'Pb', 'Hg', 'Cd']
            toxic_count = sum(1 for atom in atom_data if atom['symbol'] in toxic_elements)
            properties['environmental_safety'] = max(0.1, 1.0 - toxic_count / total_atoms * 5)
            
            # Agricultural suitability (composite score)
            properties['agricultural_suitability'] = (
                properties['biodegradability'] * 0.4 +
                properties['environmental_safety'] * 0.4 +
                properties['cost_effectiveness'] * 0.2
            )
            
            return properties
            
        except Exception as e:
            logger.error(f"Error analyzing molecule properties: {e}")
            return {prop: 0.5 for prop in ['strength', 'flexibility', 'biodegradability', 
                                         'uv_resistance', 'water_resistance', 'cost_effectiveness',
                                         'environmental_safety', 'agricultural_suitability']}
    
    def _calculate_fitness(self, current_properties: Dict[str, float], 
                          target: MaterialTarget) -> float:
        """Calculate fitness score based on how well current properties match target"""
        target_dict = target.__dict__
        
        total_score = 0
        weights = {
            'strength': 1.0,
            'flexibility': 1.0,
            'biodegradability': 1.2,  # Higher weight for environmental properties
            'uv_resistance': 0.8,
            'water_resistance': 0.8,
            'cost_effectiveness': 1.1,
            'environmental_safety': 1.3,  # Highest weight for safety
            'agricultural_suitability': 1.2
        }
        
        total_weight = 0
        for prop, target_value in target_dict.items():
            if prop in current_properties:
                current_value = current_properties[prop]
                # Calculate score (1.0 for perfect match, decreasing with distance)
                score = 1.0 - abs(target_value - current_value)
                weight = weights.get(prop, 1.0)
                total_score += score * weight
                total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0
    
    def _generate_modifications(self, molecule_string: str, current_properties: Dict[str, float],
                              target: MaterialTarget) -> List[Dict[str, Any]]:
        """Generate possible atomic-level modifications"""
        modifications = []
        atom_data = parse_molecule_string(molecule_string)
        
        # Identify properties that need improvement
        target_dict = target.__dict__
        improvements_needed = {}
        
        for prop, target_value in target_dict.items():
            if prop in current_properties:
                current_value = current_properties[prop]
                if target_value > current_value + 0.1:  # Significant improvement needed
                    improvements_needed[prop] = target_value - current_value
        
        # Generate modifications based on needed improvements
        for prop, improvement in improvements_needed.items():
            if prop == 'strength':
                modifications.extend(self._generate_strength_modifications(atom_data, improvement))
            elif prop == 'flexibility':
                modifications.extend(self._generate_flexibility_modifications(atom_data, improvement))
            elif prop == 'biodegradability':
                modifications.extend(self._generate_biodegradability_modifications(atom_data, improvement))
            elif prop == 'uv_resistance':
                modifications.extend(self._generate_uv_resistance_modifications(atom_data, improvement))
            elif prop == 'water_resistance':
                modifications.extend(self._generate_water_resistance_modifications(atom_data, improvement))
        
        return modifications
    
    def _generate_strength_modifications(self, atom_data: List[Dict], improvement: float) -> List[Dict]:
        """Generate modifications to increase material strength"""
        modifications = []
        
        # Add aromatic rings
        carbon_atoms = [i for i, atom in enumerate(atom_data) if atom['symbol'] == 'C']
        if carbon_atoms and improvement > 0.2:
            modifications.append({
                'type': 'add_aromatic_ring',
                'target_atom': carbon_atoms[0],
                'expected_improvement': improvement * 0.6,
                'description': 'Add aromatic ring to increase strength'
            })
        
        # Add amide groups
        if len(atom_data) > 3 and improvement > 0.1:
            modifications.append({
                'type': 'add_amide_group',
                'target_atom': len(atom_data) // 2,
                'expected_improvement': improvement * 0.4,
                'description': 'Add amide group for stronger intermolecular forces'
            })
        
        return modifications
    
    def _generate_flexibility_modifications(self, atom_data: List[Dict], improvement: float) -> List[Dict]:
        """Generate modifications to increase flexibility"""
        modifications = []
        
        # Add ester linkages
        if improvement > 0.15:
            modifications.append({
                'type': 'add_ester_linkage',
                'target_atom': len(atom_data) // 3,
                'expected_improvement': improvement * 0.5,
                'description': 'Add ester linkage for increased flexibility'
            })
        
        # Extend chain length
        if improvement > 0.1:
            modifications.append({
                'type': 'extend_chain',
                'target_atom': -1,  # Add to end
                'expected_improvement': improvement * 0.3,
                'description': 'Extend molecular chain for flexibility'
            })
        
        return modifications
    
    def _generate_biodegradability_modifications(self, atom_data: List[Dict], improvement: float) -> List[Dict]:
        """Generate modifications to increase biodegradability"""
        modifications = []
        
        # Add hydroxyl groups
        carbon_atoms = [i for i, atom in enumerate(atom_data) if atom['symbol'] == 'C']
        if carbon_atoms and improvement > 0.1:
            modifications.append({
                'type': 'add_hydroxyl_group',
                'target_atom': carbon_atoms[len(carbon_atoms)//2],
                'expected_improvement': improvement * 0.7,
                'description': 'Add hydroxyl group for biodegradability'
            })
        
        # Add carboxyl groups
        if improvement > 0.2:
            modifications.append({
                'type': 'add_carboxyl_group',
                'target_atom': len(atom_data) - 1,
                'expected_improvement': improvement * 0.8,
                'description': 'Add carboxyl group for enhanced biodegradation'
            })
        
        return modifications
    
    def _generate_uv_resistance_modifications(self, atom_data: List[Dict], improvement: float) -> List[Dict]:
        """Generate modifications to increase UV resistance"""
        modifications = []
        
        if improvement > 0.15:
            modifications.append({
                'type': 'add_uv_stabilizer',
                'target_atom': 0,
                'expected_improvement': improvement * 0.6,
                'description': 'Add UV-stabilizing aromatic system'
            })
        
        return modifications
    
    def _generate_water_resistance_modifications(self, atom_data: List[Dict], improvement: float) -> List[Dict]:
        """Generate modifications to increase water resistance"""
        modifications = []
        
        if improvement > 0.1:
            modifications.append({
                'type': 'add_hydrophobic_group',
                'target_atom': len(atom_data) // 2,
                'expected_improvement': improvement * 0.5,
                'description': 'Add hydrophobic groups for water resistance'
            })
        
        return modifications
    
    def _apply_modification(self, molecule_string: str, modification: Dict[str, Any]) -> str:
        """Apply atomic-level modification to molecule"""
        atom_data = parse_molecule_string(molecule_string)
        
        mod_type = modification['type']
        target_atom = modification['target_atom']
        
        if mod_type == 'add_hydroxyl_group':
            # Add OH group to target carbon
            if target_atom < len(atom_data) and atom_data[target_atom]['symbol'] == 'C':
                base_pos = [atom_data[target_atom]['x'], atom_data[target_atom]['y'], atom_data[target_atom]['z']]
                # Add oxygen
                atom_data.append({
                    'symbol': 'O',
                    'x': base_pos[0] + 1.4,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
                # Add hydrogen
                atom_data.append({
                    'symbol': 'H',
                    'x': base_pos[0] + 2.4,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
        
        elif mod_type == 'add_carboxyl_group':
            # Add COOH group
            if target_atom < len(atom_data):
                base_pos = [atom_data[target_atom]['x'], atom_data[target_atom]['y'], atom_data[target_atom]['z']]
                # Add carbon
                atom_data.append({
                    'symbol': 'C',
                    'x': base_pos[0] + 1.5,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
                # Add double-bonded oxygen
                atom_data.append({
                    'symbol': 'O',
                    'x': base_pos[0] + 1.5,
                    'y': base_pos[1] + 1.2,
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
                # Add OH group
                atom_data.append({
                    'symbol': 'O',
                    'x': base_pos[0] + 2.9,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
                atom_data.append({
                    'symbol': 'H',
                    'x': base_pos[0] + 3.9,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
        
        elif mod_type == 'extend_chain':
            # Add carbon to extend chain
            if atom_data:
                last_atom = atom_data[-1]
                atom_data.append({
                    'symbol': 'C',
                    'x': last_atom['x'] + 1.5,
                    'y': last_atom['y'],
                    'z': last_atom['z'],
                    'atom_id': len(atom_data)
                })
                # Add hydrogens
                for i in range(2):
                    atom_data.append({
                        'symbol': 'H',
                        'x': last_atom['x'] + 1.5,
                        'y': last_atom['y'] + (i * 2 - 1) * 1.1,
                        'z': last_atom['z'] + 1.1,
                        'atom_id': len(atom_data)
                    })
        
        elif mod_type == 'add_ester_linkage':
            # Add ester group (COO)
            if target_atom < len(atom_data):
                base_pos = [atom_data[target_atom]['x'], atom_data[target_atom]['y'], atom_data[target_atom]['z']]
                # Add carbon
                atom_data.append({
                    'symbol': 'C',
                    'x': base_pos[0] + 1.5,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
                # Add double-bonded oxygen
                atom_data.append({
                    'symbol': 'O',
                    'x': base_pos[0] + 1.5,
                    'y': base_pos[1] + 1.2,
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
                # Add single-bonded oxygen
                atom_data.append({
                    'symbol': 'O',
                    'x': base_pos[0] + 2.9,
                    'y': base_pos[1],
                    'z': base_pos[2],
                    'atom_id': len(atom_data)
                })
        
        return molecule_to_string(atom_data)
    
    def _generate_recommendations(self, achieved_properties: Dict[str, float], 
                                target: MaterialTarget) -> List[str]:
        """Generate design recommendations based on results"""
        recommendations = []
        target_dict = target.__dict__
        
        for prop, target_value in target_dict.items():
            if prop in achieved_properties:
                achieved_value = achieved_properties[prop]
                if target_value > achieved_value + 0.1:
                    recommendations.append(
                        f"Consider additional modifications to improve {prop}: "
                        f"target {target_value:.2f}, achieved {achieved_value:.2f}"
                    )
                elif achieved_value > target_value + 0.1:
                    recommendations.append(
                        f"{prop.capitalize()} exceeded target: "
                        f"achieved {achieved_value:.2f} vs target {target_value:.2f}"
                    )
        
        # Add general recommendations
        if achieved_properties.get('environmental_safety', 0) < 0.8:
            recommendations.append("Consider replacing toxic elements with safer alternatives")
        
        if achieved_properties.get('cost_effectiveness', 0) < 0.6:
            recommendations.append("Simplify molecular structure to reduce production costs")
        
        if achieved_properties.get('agricultural_suitability', 0) < 0.7:
            recommendations.append("Optimize for agricultural applications by improving biodegradability and safety")
        
        return recommendations
    
    def create_molecular_library(self, base_molecules: List[str], 
                               property_targets: List[MaterialTarget]) -> Dict[str, Any]:
        """Create a library of designed materials for different applications"""
        library = {
            'created_at': datetime.now().isoformat(),
            'base_molecules_count': len(base_molecules),
            'target_variations': len(property_targets),
            'designed_materials': []
        }
        
        for i, base_molecule in enumerate(base_molecules):
            for j, target in enumerate(property_targets):
                logger.info(f"Designing material {i+1}-{j+1}: base {i+1}, target {j+1}")
                
                design_result = self.design_material(base_molecule, target, max_iterations=5)
                
                if design_result['success']:
                    library['designed_materials'].append({
                        'id': f"material_{i+1}_{j+1}",
                        'base_molecule_index': i,
                        'target_index': j,
                        'design_result': design_result
                    })
        
        library['total_designed'] = len(library['designed_materials'])
        library['success_rate'] = len(library['designed_materials']) / (len(base_molecules) * len(property_targets))
        
        return library

# Global designer instance
sub_atomic_designer = SubAtomicDesigner()
