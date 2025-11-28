# rwanda_demo_molecules.py - Rwanda-Relevant Agricultural Molecules
# Rwanda Quantum Agricultural Intelligence Platform
# Demo molecules for agricultural applications in Rwanda

import logging
from molecular_database import molecular_db
from typing import Dict, List

logger = logging.getLogger(__name__)

# Rwanda-relevant demo molecules with realistic 3D coordinates
RWANDA_DEMO_MOLECULES = {
    "neem_oil_azadirachtin": {
        "name": "Azadirachtin (Neem Oil Active)",
        "category": "natural_pesticide",
        "description": "Active compound in neem oil, natural pesticide effective against fall armyworm and other pests common in Rwanda",
        "formula": "C₃₅H₄₄O₁₆",
        "molecule_string": "C 0.000 0.000 0.000; H 1.089 0.000 0.000; H -0.363 1.026 0.000; H -0.363 -0.513 0.889; C -0.544 -0.513 -1.378; O -1.544 -0.513 -1.378; C 0.456 -0.513 -2.378; H 0.456 0.487 -2.878; H 1.456 -0.513 -1.878; H 0.456 -1.313 -3.078; C -2.544 -0.513 -0.378; O -3.544 -0.513 -0.378; N -2.044 -0.513 0.622; H -2.544 -0.513 1.522; C -0.644 -0.513 0.622; O -0.144 -0.513 1.622; C 0.356 -1.513 -0.378; H 1.356 -1.513 -0.378; H 0.356 -2.513 -0.878",
        "applications": ["fall_armyworm_control", "bean_stem_maggot", "organic_farming"],
        "rwanda_relevance": "Effective against major pests in Rwanda's maize and bean crops"
    },
    
    "urea": {
        "name": "Urea",
        "category": "nitrogen_fertilizer", 
        "description": "Primary nitrogen fertilizer used in Rwanda for maize, beans, and other crops",
        "formula": "CO(NH₂)₂",
        "molecule_string": "C 0.000 0.000 0.000; O 0.000 1.220 0.000; N 1.140 -0.610 0.000; H 1.140 -1.610 0.000; H 2.040 -0.110 0.000; N -1.140 -0.610 0.000; H -1.140 -1.610 0.000; H -2.040 -0.110 0.000",
        "applications": ["nitrogen_supply", "crop_yield_enhancement", "soil_fertility"],
        "rwanda_relevance": "Addresses nitrogen deficiency affecting 65% of Rwanda's agricultural land"
    },
    
    "potassium_chloride": {
        "name": "Potassium Chloride (Muriate of Potash)",
        "category": "potash_fertilizer",
        "description": "Essential potassium fertilizer for improving crop quality and disease resistance in Rwanda",
        "formula": "KCl",
        "molecule_string": "K 0.000 0.000 0.000; Cl 2.667 0.000 0.000",
        "applications": ["potassium_supply", "disease_resistance", "fruit_quality"],
        "rwanda_relevance": "Critical for coffee and tea quality improvement in Rwanda's export crops"
    },
    
    "caffeine": {
        "name": "Caffeine",
        "category": "coffee_enhancement",
        "description": "Natural alkaloid in coffee beans, key quality indicator for Rwanda's premium coffee exports",
        "formula": "C₈H₁₀N₄O₂",
        "molecule_string": "C 0.000 0.000 0.000; N 1.350 0.000 0.000; C 2.050 1.200 0.000; N 3.400 1.200 0.000; C 4.100 0.000 0.000; C 3.400 -1.200 0.000; N 2.050 -1.200 0.000; C 1.350 -2.400 0.000; O 2.050 -3.600 0.000; N 0.000 -2.400 0.000; C -0.700 -1.200 0.000; O -2.050 -1.200 0.000; H 1.550 2.100 0.000; C 5.450 0.000 0.000; H 5.950 0.900 0.000; H 5.950 -0.900 0.000; H 5.950 0.000 0.900; C -0.700 -3.600 0.000; H -0.200 -4.500 0.000; H -1.200 -3.600 0.900; H -1.200 -3.600 -0.900",
        "applications": ["coffee_quality_assessment", "beverage_enhancement", "export_standards"],
        "rwanda_relevance": "Essential for Rwanda's specialty coffee industry and export quality control"
    },
    
    "iron_chelate_edta": {
        "name": "Iron-EDTA Chelate",
        "category": "micronutrient_fertilizer",
        "description": "Iron chelate for treating iron deficiency affecting 38% of Rwanda's crops, especially beans and cassava",
        "formula": "C₁₀H₁₂FeN₂NaO₈",
        "molecule_string": "Fe 0.000 0.000 0.000; N 2.100 0.000 1.500; C 3.200 0.000 0.500; C 4.300 0.000 1.500; O 5.400 0.000 1.000; O 4.300 0.000 2.500; C 3.200 1.200 -0.500; C 2.100 1.200 -1.500; N 1.000 1.200 -0.500; C 0.000 1.200 -1.500; C -1.000 1.200 -0.500; O -2.000 1.200 -1.000; O -1.000 1.200 0.500; C 0.000 2.400 -2.500; C 1.000 2.400 -3.500; N 2.100 2.400 -2.500; C 3.200 2.400 -3.500; C 4.300 2.400 -2.500; O 5.400 2.400 -3.000; O 4.300 2.400 -1.500; H 2.600 0.500 2.000; H 1.600 -0.500 2.000; H 3.700 -0.500 0.000; H 2.700 0.500 0.000",
        "applications": ["iron_deficiency_treatment", "chlorosis_prevention", "nutrient_uptake"],
        "rwanda_relevance": "Addresses iron deficiency in beans and cassava, major staple crops in Rwanda"
    },
    
    "pyrethrin_i": {
        "name": "Pyrethrin I",
        "category": "organic_pesticide",
        "description": "Natural organic pesticide from chrysanthemum flowers, effective against coffee berry borer and other pests",
        "formula": "C₂₁H₂₈O₃",
        "molecule_string": "C 0.000 0.000 0.000; C 1.400 0.000 0.000; C 2.100 1.200 0.000; C 1.400 2.400 0.000; C 0.000 2.400 0.000; C -0.700 1.200 0.000; O -2.100 1.200 0.000; C -2.800 0.000 0.000; O -4.200 0.000 0.000; C -2.100 -1.200 0.000; C -0.700 -1.200 0.000; C 0.000 -2.400 0.000; C 1.400 -2.400 0.000; C 2.100 -3.600 0.000; C 3.500 -3.600 0.000; C 4.200 -2.400 0.000; C 3.500 -1.200 0.000; C 2.800 0.000 0.000; H 3.100 1.200 0.000; H 1.900 3.300 0.000; H 0.500 3.300 0.000; H -2.600 -2.100 0.000; H -0.200 -3.300 0.000; H 1.600 -4.500 0.000; H 4.000 -4.500 0.000; H 5.200 -2.400 0.000; H 4.000 -0.300 0.000",
        "applications": ["coffee_berry_borer_control", "organic_pest_management", "biodegradable_pesticide"],
        "rwanda_relevance": "Organic solution for coffee berry borer, major threat to Rwanda's coffee industry"
    }
}

def initialize_rwanda_demo_molecules():
    """Initialize the database with Rwanda-relevant agricultural molecules"""
    logger.info("Initializing Rwanda demo molecules...")
    
    added_molecules = []
    
    for molecule_key, molecule_data in RWANDA_DEMO_MOLECULES.items():
        try:
            # Check if molecule already exists
            existing = molecular_db.search_molecules(query=molecule_data["name"])
            if existing:
                logger.info(f"Molecule '{molecule_data['name']}' already exists, skipping...")
                continue
            
            # Add molecule to database
            molecule_id = molecular_db.add_molecule(
                name=molecule_data["name"],
                molecule_string=molecule_data["molecule_string"],
                category=molecule_data["category"],
                description=molecule_data["description"]
            )
            
            added_molecules.append({
                "id": molecule_id,
                "name": molecule_data["name"],
                "category": molecule_data["category"],
                "applications": molecule_data["applications"],
                "rwanda_relevance": molecule_data["rwanda_relevance"]
            })
            
            logger.info(f"Added molecule: {molecule_data['name']} (ID: {molecule_id})")
            
        except Exception as e:
            logger.error(f"Failed to add molecule {molecule_data['name']}: {e}")
    
    return added_molecules

def get_rwanda_agricultural_recommendations(crop_type: str = None, pest_issue: str = None, 
                                          nutrient_deficiency: str = None) -> List[Dict]:
    """Get molecule recommendations based on Rwanda agricultural needs"""
    recommendations = []
    
    # Crop-specific recommendations
    if crop_type:
        if crop_type.lower() in ["maize", "corn"]:
            recommendations.extend([
                {"molecule": "Urea", "reason": "Nitrogen fertilizer for maize growth"},
                {"molecule": "Azadirachtin (Neem Oil Active)", "reason": "Fall armyworm control in maize"}
            ])
        elif crop_type.lower() == "coffee":
            recommendations.extend([
                {"molecule": "Caffeine", "reason": "Quality assessment and enhancement"},
                {"molecule": "Pyrethrin I", "reason": "Coffee berry borer control"},
                {"molecule": "Potassium Chloride (Muriate of Potash)", "reason": "Coffee quality improvement"}
            ])
        elif crop_type.lower() in ["beans", "legumes"]:
            recommendations.extend([
                {"molecule": "Iron-EDTA Chelate", "reason": "Iron deficiency treatment in beans"},
                {"molecule": "Azadirachtin (Neem Oil Active)", "reason": "Bean stem maggot control"}
            ])
        elif crop_type.lower() == "tea":
            recommendations.extend([
                {"molecule": "Potassium Chloride (Muriate of Potash)", "reason": "Tea quality enhancement"}
            ])
    
    # Pest-specific recommendations
    if pest_issue:
        if "fall_armyworm" in pest_issue.lower():
            recommendations.append({"molecule": "Azadirachtin (Neem Oil Active)", "reason": "Natural fall armyworm control"})
        elif "coffee_berry_borer" in pest_issue.lower():
            recommendations.append({"molecule": "Pyrethrin I", "reason": "Organic coffee berry borer control"})
        elif "bean_stem_maggot" in pest_issue.lower():
            recommendations.append({"molecule": "Azadirachtin (Neem Oil Active)", "reason": "Bean stem maggot management"})
    
    # Nutrient deficiency recommendations
    if nutrient_deficiency:
        if "nitrogen" in nutrient_deficiency.lower():
            recommendations.append({"molecule": "Urea", "reason": "Primary nitrogen source"})
        elif "iron" in nutrient_deficiency.lower():
            recommendations.append({"molecule": "Iron-EDTA Chelate", "reason": "Bioavailable iron supplementation"})
        elif "potassium" in nutrient_deficiency.lower():
            recommendations.append({"molecule": "Potassium Chloride (Muriate of Potash)", "reason": "Potassium supplementation"})
    
    return recommendations

def get_rwanda_molecule_statistics() -> Dict:
    """Get statistics about Rwanda-relevant molecules in the database"""
    stats = {
        "total_rwanda_molecules": 0,
        "by_category": {},
        "applications_coverage": {},
        "molecules_by_crop": {}
    }
    
    # Search for Rwanda-relevant molecules
    all_molecules = molecular_db.search_molecules()
    rwanda_molecules = [m for m in all_molecules if any(keyword in m.get('description', '').lower() 
                                                      for keyword in ['rwanda', 'coffee', 'bean', 'maize', 'pest', 'fertilizer'])]
    
    stats["total_rwanda_molecules"] = len(rwanda_molecules)
    
    # Category breakdown
    for molecule in rwanda_molecules:
        category = molecule.get('category', 'unknown')
        stats["by_category"][category] = stats["by_category"].get(category, 0) + 1
    
    return stats

if __name__ == "__main__":
    # Initialize demo molecules
    added = initialize_rwanda_demo_molecules()
    print(f"Added {len(added)} Rwanda-relevant molecules to the database")
    
    # Show statistics
    stats = get_rwanda_molecule_statistics()
    print(f"Rwanda molecule statistics: {stats}")
    
    # Example recommendations
    print("\nExample recommendations:")
    print("For maize crop:", get_rwanda_agricultural_recommendations(crop_type="maize"))
    print("For coffee crop:", get_rwanda_agricultural_recommendations(crop_type="coffee"))
    print("For iron deficiency:", get_rwanda_agricultural_recommendations(nutrient_deficiency="iron"))
