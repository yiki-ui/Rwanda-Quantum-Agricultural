# Rwanda Quantum Agricultural Intelligence Platform
# NISR 2025 Big Data Hackathon - Track 5: Open Innovation
# Quantum molecular simulation for agricultural solutions

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import numpy as np
import pandas as pd
from datetime import datetime, date
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import quantum simulation core
from simulation_core import (
    run_molecule_simulation,
    parse_molecule_string,
    run_bond_scan,
    find_optimized_geometry,
    find_transition_state,
    simplified_molecular_docking,
    predict_material_properties,
    generate_hackathon_dashboard_data
)

# Import molecular database and sub-atomic designer
from molecular_database import molecular_db
from sub_atomic_designer import sub_atomic_designer, MaterialTarget
from rwanda_demo_molecules import (
    initialize_rwanda_demo_molecules,
    get_rwanda_agricultural_recommendations,
    get_rwanda_molecule_statistics,
    RWANDA_DEMO_MOLECULES
)

# Import AI Agent
from ai_agent import (
    AIAgent,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    process_chat_message,
    get_agent_info
)

app = FastAPI(
    title="Rwanda Quantum Agricultural Intelligence",
    description="Revolutionary agricultural platform using quantum molecular simulation for crop protection, nutrition enhancement, and sustainable farming materials",
    version="2.0.0"
)

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"  #for test and development do not laugh at me please
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models with Quantum Integration ---

class LocationData(BaseModel):
    latitude: float = Field(..., ge=-2.5, le=-1.0)
    longitude: float = Field(..., ge=28.8, le=30.9)
    altitude: Optional[float] = None
    district: Optional[str] = None
    sector: Optional[str] = None

class MolecularPesticideRequest(BaseModel):
    target_pest: str = Field(..., description="e.g., fall_armyworm, aphids, coffee_berry_borer")
    crop_type: str = Field(..., description="maize, beans, coffee, etc.")
    environmental_safety_level: str = Field("high", description="high, medium, low")
    biodegradability_required: bool = Field(True)
    location: LocationData

class MolecularPesticideResponse(BaseModel):
    success: bool
    recommended_molecule: Optional[str] = None
    molecule_structure: Optional[List[Dict]] = None
    efficacy_prediction: Optional[float] = None
    toxicity_profile: Optional[Dict] = None
    biodegradation_time_days: Optional[float] = None
    binding_affinity_score: Optional[float] = None
    environmental_impact_score: Optional[float] = None
    cost_estimate_usd_per_kg: Optional[float] = None
    synthesis_pathway: Optional[List[str]] = None
    error: Optional[str] = None

class NutrientEnhancementRequest(BaseModel):
    target_crop: str = Field(..., description="crop to enhance")
    deficient_nutrients: List[str] = Field(..., description="List of deficient nutrients")
    enhancement_method: str = Field("biofortification", description="biofortification, foliar_spray, soil_amendment")
    target_increase_percent: float = Field(50, ge=10, le=200)

class NutrientEnhancementResponse(BaseModel):
    success: bool
    enhancement_compounds: Optional[List[Dict]] = None
    molecular_structures: Optional[List[Dict]] = None
    absorption_efficiency: Optional[float] = None
    stability_analysis: Optional[Dict] = None
    application_method: Optional[str] = None
    dosage_recommendations: Optional[Dict] = None
    bioavailability_score: Optional[float] = None
    interaction_warnings: Optional[List[str]] = None
    error: Optional[str] = None

class SustainableMaterialRequest(BaseModel):
    application: str = Field(..., description="packaging, mulch_film, irrigation_tubing, greenhouse_material")
    source_materials: List[str] = Field(..., description="cassava_starch, banana_fiber, coffee_husks")
    required_properties: List[str] = Field(..., description="biodegradable, UV_resistant, water_resistant")
    performance_duration_months: float = Field(6, ge=1, le=36)

class SustainableMaterialResponse(BaseModel):
    success: bool
    material_composition: Optional[str] = None
    molecular_structure: Optional[List[Dict]] = None
    predicted_properties: Optional[Dict] = None
    degradation_pathway: Optional[List[str]] = None
    manufacturing_process: Optional[List[str]] = None
    cost_analysis: Optional[Dict] = None
    environmental_benefits: Optional[List[str]] = None
    performance_metrics: Optional[Dict] = None
    error: Optional[str] = None

class MolecularDockingAnalysisRequest(BaseModel):
    compound_string: str = Field(..., description="Molecular structure of test compound")
    target_site: str = Field(..., description="pest_receptor, nutrient_carrier, plant_membrane")
    analysis_type: str = Field("binding_affinity", description="binding_affinity, toxicity_assessment, absorption_rate")

# New data models for molecular database and sub-atomic design
class MoleculeUploadRequest(BaseModel):
    name: str = Field(..., description="Name for the molecule")
    molecule_string: str = Field(..., description="Molecule structure string")
    category: str = Field("general", description="Category: pesticide, nutrient, material, general")
    description: Optional[str] = Field(None, description="Description of the molecule")

class MoleculeUploadResponse(BaseModel):
    success: bool
    molecule_id: Optional[int] = None
    message: str
    molecular_properties: Optional[Dict] = None
    error: Optional[str] = None

class SubAtomicDesignRequest(BaseModel):
    base_molecule_id: int = Field(..., description="ID of base molecule to modify")
    target_strength: float = Field(0.5, ge=0.0, le=1.0, description="Target strength (0-1)")
    target_flexibility: float = Field(0.5, ge=0.0, le=1.0, description="Target flexibility (0-1)")
    target_biodegradability: float = Field(0.7, ge=0.0, le=1.0, description="Target biodegradability (0-1)")
    target_uv_resistance: float = Field(0.5, ge=0.0, le=1.0, description="Target UV resistance (0-1)")
    target_water_resistance: float = Field(0.5, ge=0.0, le=1.0, description="Target water resistance (0-1)")
    target_cost_effectiveness: float = Field(0.6, ge=0.0, le=1.0, description="Target cost effectiveness (0-1)")
    target_environmental_safety: float = Field(0.8, ge=0.0, le=1.0, description="Target environmental safety (0-1)")
    target_agricultural_suitability: float = Field(0.7, ge=0.0, le=1.0, description="Target agricultural suitability (0-1)")
    max_iterations: int = Field(10, ge=1, le=50, description="Maximum design iterations")

class SubAtomicDesignResponse(BaseModel):
    success: bool
    original_molecule_id: Optional[int] = None
    designed_molecule_id: Optional[int] = None
    design_results: Optional[Dict] = None
    fitness_score: Optional[float] = None
    design_iterations: Optional[int] = None
    recommendations: Optional[List[str]] = None
    error: Optional[str] = None

class MoleculeSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query for name or description")
    category: Optional[str] = Field(None, description="Filter by category")
    min_atoms: Optional[int] = Field(None, description="Minimum number of atoms")
    max_atoms: Optional[int] = Field(None, description="Maximum number of atoms")
    limit: int = Field(20, ge=1, le=100, description="Maximum results to return")

class MolecularLibraryRequest(BaseModel):
    base_molecules: List[str] = Field(..., description="List of base molecule strings")
    applications: List[str] = Field(..., description="Target applications: packaging, mulch, irrigation, etc.")
    performance_requirements: Dict[str, float] = Field(..., description="Performance requirements for each property")

# Rwanda-specific data models
class RwandaRecommendationRequest(BaseModel):
    crop_type: Optional[str] = Field(None, description="Crop type: maize, coffee, beans, tea, cassava, potato")
    pest_issue: Optional[str] = Field(None, description="Pest problem: fall_armyworm, coffee_berry_borer, bean_stem_maggot")
    nutrient_deficiency: Optional[str] = Field(None, description="Nutrient deficiency: nitrogen, iron, potassium")
    district: Optional[str] = Field(None, description="Rwanda district for location-specific recommendations")

class RwandaRecommendationResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, str]]
    total_recommendations: int
    location_specific_notes: Optional[List[str]] = None
    error: Optional[str] = None

class RwandaMoleculeStatsResponse(BaseModel):
    success: bool
    total_rwanda_molecules: int
    by_category: Dict[str, int]
    applications_coverage: Dict[str, int]
    molecules_by_crop: Dict[str, int]
    error: Optional[str] = None

# --- Quantum Agricultural Functions ---

def design_molecular_pesticide(request: MolecularPesticideRequest) -> Dict[str, Any]:
    """Uses quantum molecular simulation to design targeted, environmentally safe pesticides"""
    try:
        pest_targets = {
            "fall_armyworm": {
                "target_receptor": "sodium_channel",
                "known_inhibitors": ["pyrethroids", "organophosphates"],
                "binding_site": "C 0 0 0; N 1.5 0 0; O 0 1.5 0; S -1.5 0 0"
            },
            "aphids": {
                "target_receptor": "acetylcholine_esterase",
                "known_inhibitors": ["neonicotinoids", "carbamates"],
                "binding_site": "C 0 0 0; N 2.0 0 0; O 0 2.0 0; P -2.0 0 0"
            },
            "coffee_berry_borer": {
                "target_receptor": "chitin_synthesis",
                "known_inhibitors": ["benzoylureas", "chitin_inhibitors"],
                "binding_site": "C 0 0 0; N 1.8 0 0; O 0 1.8 0; F -1.8 0 0"
            }
        }
        
        if request.target_pest.lower() not in pest_targets:
            raise ValueError(f"Target pest {request.target_pest} not in database")
        
        target_info = pest_targets[request.target_pest.lower()]
        
        base_molecules = [
            "C 0 0 0; C 1.5 0 0; N 3.0 0 0; O 1.5 1.5 0; H 0 -1 0; H 1.5 -1 0",
            "C 0 0 0; C 1.4 0 0; C 2.8 0 0; N 4.2 0 0; O 2.8 1.4 0; Cl 0 -1.4 0",
            "C 0 0 0; C 1.3 0.8 0; C 2.6 0 0; N 3.9 0.8 0; O 2.6 1.6 0; F 0 -1.3 0"
        ]
        
        best_molecule = None
        best_score = -float('inf')
        best_binding_affinity = 0
        
        for molecule_string in base_molecules:
            sim_result = run_molecule_simulation(molecule_string, method="hf")
            
            if not sim_result["success"]:
                continue
            
            docking_result = simplified_molecular_docking(
                molecule_string, 
                target_info["binding_site"], 
                num_poses=3
            )
            
            if not docking_result["success"]:
                continue
            
            binding_score = max([pose["score"] for pose in docking_result["poses"]]) if docking_result["poses"] else 0
            
            dipole_magnitude = np.linalg.norm(sim_result["dipole_moment"]) if sim_result["dipole_moment"] else 0
            biodegradability_score = min(100, dipole_magnitude * 20)
            toxicity_score = max(0, 100 - abs(sum([atom.get("charge", 0) for atom in sim_result["atom_data"]])) * 50)
            
            if request.environmental_safety_level == "high":
                total_score = binding_score * 0.4 + biodegradability_score * 0.3 + toxicity_score * 0.3
            else:
                total_score = binding_score * 0.7 + biodegradability_score * 0.2 + toxicity_score * 0.1
            
            if total_score > best_score:
                best_score = total_score
                best_molecule = molecule_string
                best_binding_affinity = binding_score
        
        if not best_molecule:
            raise Exception("No suitable pesticide molecule found")
        
        final_sim = run_molecule_simulation(best_molecule, method="hf")
        
        dipole_mag = np.linalg.norm(final_sim["dipole_moment"]) if final_sim["dipole_moment"] else 0
        biodegradation_time = max(7, 60 - dipole_mag * 15)
        
        num_atoms = len(final_sim["atom_data"])
        complexity_factor = 1 + (num_atoms - 6) * 0.1
        base_cost = 50
        estimated_cost = base_cost * complexity_factor
        
        return {
            "success": True,
            "recommended_molecule": best_molecule,
            "molecule_structure": final_sim["atom_data"],
            "efficacy_prediction": best_binding_affinity,
            "toxicity_profile": {
                "mammalian_toxicity": "low" if toxicity_score > 70 else "moderate",
                "aquatic_toxicity": "low" if biodegradability_score > 50 else "moderate",
                "soil_persistence": "low" if biodegradation_time < 30 else "moderate"
            },
            "biodegradation_time_days": biodegradation_time,
            "binding_affinity_score": best_binding_affinity,
            "environmental_impact_score": (biodegradability_score + toxicity_score) / 2,
            "cost_estimate_usd_per_kg": estimated_cost,
            "synthesis_pathway": [
                "Source renewable feedstock (agricultural waste)",
                "Fermentation-based precursor synthesis", 
                "Green chemistry coupling reactions",
                "Purification and formulation",
                "Quality control and stability testing"
            ]
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

def design_nutrient_enhancement(request: NutrientEnhancementRequest) -> Dict[str, Any]:
    """Designs molecular compounds to enhance nutrient content and bioavailability in crops"""
    try:
        nutrient_carriers = {
            "iron": {
                "chelation_agents": [
                    "C 0 0 0; C 1.5 0 0; N 3.0 0 0; O 1.5 1.5 0; Fe 4.5 0.75 0",
                    "C 0 0 0; N 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Fe 4.2 0.7 0"
                ],
                "bioavailability_enhancers": ["ascorbic_acid", "citric_acid", "amino_acids"]
            },
            "zinc": {
                "chelation_agents": [
                    "C 0 0 0; C 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Zn 4.2 0.7 0",
                    "C 0 0 0; N 1.5 0 0; S 3.0 0 0; O 1.5 1.5 0; Zn 4.5 0.75 0"
                ],
                "bioavailability_enhancers": ["picolinic_acid", "histidine", "cysteine"]
            },
            "vitamin_a": {
                "precursors": [
                    "C 0 0 0; C 1.4 0 0; C 2.8 0 0; C 4.2 0 0; C 5.6 0 0; C 7.0 0 0",
                    "C 0 0 0; C 1.5 0 0; C 3.0 0 0; O 4.5 0 0; C 6.0 0 0; C 7.5 0 0"
                ],
                "stability_enhancers": ["tocopherols", "antioxidants", "encapsulation"]
            }
        }
        
        enhancement_compounds = []
        molecular_structures = []
        
        for nutrient in request.deficient_nutrients:
            if nutrient.lower() in nutrient_carriers:
                carrier_info = nutrient_carriers[nutrient.lower()]
                
                for carrier_molecule in carrier_info.get("chelation_agents", carrier_info.get("precursors", [])):
                    sim_result = run_molecule_simulation(carrier_molecule, method="hf")
                    
                    if not sim_result["success"]:
                        continue
                    
                    dipole_moment = sim_result.get("dipole_moment", [0, 0, 0])
                    polarity = np.linalg.norm(dipole_moment)
                    
                    optimal_polarity = 2.5
                    absorption_efficiency = 100 * np.exp(-((polarity - optimal_polarity)**2) / (2 * 1.0**2))
                    
                    stability_score = 100
                    if sim_result.get("vibrational_frequencies"):
                        min_freq = min(sim_result["vibrational_frequencies"])
                        if min_freq < 200:
                            stability_score = max(50, min_freq / 2)
                    
                    enhancement_compounds.append({
                        "nutrient": nutrient,
                        "compound_type": f"{nutrient}_carrier",
                        "molecule_string": carrier_molecule,
                        "absorption_efficiency": absorption_efficiency,
                        "stability_score": stability_score,
                        "polarity": polarity,
                        "recommended_dosage_ppm": max(1, 100 / absorption_efficiency * 10)
                    })
                    
                    molecular_structures.append({
                        "nutrient": nutrient,
                        "atom_data": sim_result["atom_data"],
                        "energy": sim_result.get("classical_energy", 0),
                        "dipole_moment": dipole_moment
                    })
        
        best_compounds = []
        for nutrient in request.deficient_nutrients:
            nutrient_compounds = [c for c in enhancement_compounds if c["nutrient"] == nutrient]
            if nutrient_compounds:
                best_compound = max(nutrient_compounds, key=lambda x: x["absorption_efficiency"] * x["stability_score"])
                best_compounds.append(best_compound)
        
        if request.enhancement_method == "biofortification":
            application_method = "Genetic enhancement of biosynthesis pathways"
        elif request.enhancement_method == "foliar_spray":
            application_method = "Foliar application during vegetative growth"
        else:
            application_method = "Soil incorporation before planting"
        
        avg_absorption = np.mean([c["absorption_efficiency"] for c in best_compounds]) if best_compounds else 0
        avg_stability = np.mean([c["stability_score"] for c in best_compounds]) if best_compounds else 0
        bioavailability_score = (avg_absorption + avg_stability) / 2
        
        return {
            "success": True,
            "enhancement_compounds": best_compounds,
            "molecular_structures": molecular_structures[:10],
            "absorption_efficiency": avg_absorption,
            "stability_analysis": {
                "thermal_stability": "high" if avg_stability > 80 else "moderate",
                "oxidation_resistance": "high" if avg_stability > 70 else "moderate",
                "ph_stability": "moderate"
            },
            "application_method": application_method,
            "dosage_recommendations": {
                nutrient: f"{compound['recommended_dosage_ppm']:.1f} ppm" 
                for compound in best_compounds for nutrient in [compound["nutrient"]]
            },
            "bioavailability_score": bioavailability_score,
            "interaction_warnings": [
                "Monitor soil pH after application",
                "Avoid mixing with high-phosphate fertilizers",
                "Apply during optimal weather conditions"
            ]
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

def design_sustainable_agricultural_material(request: SustainableMaterialRequest) -> Dict[str, Any]:
    """Uses existing predict_material_properties function to design sustainable agricultural materials"""
    try:
        source_molecules = {
            "cassava_starch": "C 6 0 0; O 0 3 0; H 3 3 0; H 9 3 0; H 6 6 0; H 6 -3 0",
            "banana_fiber": "C 0 0 0; C 1.4 0 0; O 2.8 0 0; H 0 1.4 0; H 1.4 1.4 0; H 2.8 1.4 0",
            "coffee_husks": "C 0 0 0; C 1.5 0.8 0; O 3.0 0 0; N 1.5 -1.2 0; H 0 1.4 0; H 3.0 1.4 0"
        }
        
        selected_molecules = []
        for source in request.source_materials:
            if source.lower() in source_molecules:
                selected_molecules.append(source_molecules[source.lower()])
        
        if not selected_molecules:
            raise ValueError("No valid source materials provided")
        
        base_molecule = selected_molecules[0]
        
        material_analysis = predict_material_properties(
            base_molecule, 
            num_repeats=min(4, len(selected_molecules) + 1)
        )
        
        if not material_analysis["success"]:
            raise Exception(f"Material analysis failed: {material_analysis.get('error', 'Unknown error')}")
        
        predicted_properties = {}
        
        energy_density = material_analysis.get("conceptual_energy_density", 0)
        dipole_magnitude = material_analysis.get("conceptual_avg_dipole_moment_magnitude", 0)
        
        biodegradation_months = max(1, 12 * np.exp(-dipole_magnitude / 2))
        predicted_properties["biodegradation_time_months"] = biodegradation_months
        predicted_properties["biodegradable"] = biodegradation_months <= request.performance_duration_months * 2
        
        max_freq = material_analysis.get("conceptual_highest_vibrational_frequency", 0)
        uv_resistance_score = min(100, max_freq / 40)
        predicted_properties["uv_resistance_score"] = uv_resistance_score
        predicted_properties["UV_resistant"] = uv_resistance_score > 60
        
        water_resistance_score = max(0, 100 - dipole_magnitude * 15)
        predicted_properties["water_resistance_score"] = water_resistance_score
        predicted_properties["water_resistant"] = water_resistance_score > 50
        
        manufacturing_steps = [
            "Collection and preparation of agricultural waste",
            "Biomass preprocessing and size reduction",
            "Chemical treatment for fiber extraction",
            "Molecular cross-linking and polymerization",
            "Forming and shaping processes",
            "Quality control and testing",
            "Packaging for distribution"
        ]
        
        raw_material_cost = len(selected_molecules) * 0.5
        processing_cost = 2.0 + (len(manufacturing_steps) * 0.3)
        total_cost = raw_material_cost + processing_cost
        
        cost_analysis = {
            "raw_materials_usd_per_kg": raw_material_cost,
            "processing_cost_usd_per_kg": processing_cost,
            "total_cost_usd_per_kg": total_cost,
            "cost_comparison_conventional": total_cost / 8.0
        }
        
        environmental_benefits = [
            f"Reduces agricultural waste by utilizing {', '.join(request.source_materials)}",
            f"Biodegrades in {biodegradation_months:.1f} months vs. centuries for plastics",
            "Zero petroleum-based inputs required",
            "Carbon neutral or negative lifecycle",
            "Supports circular economy in agriculture",
            "Creates additional income stream for farmers"
        ]
        
        performance_metrics = {
            "strength_mpa": max(10, energy_density * 2),
            "flexibility_score": min(100, dipole_magnitude * 25),
            "durability_months": min(request.performance_duration_months * 1.2, biodegradation_months * 0.8),
            "temperature_resistance_celsius": 60 + max_freq / 100
        }
        
        return {
            "success": True,
            "material_composition": f"Bio-composite from {', '.join(request.source_materials)}",
            "molecular_structure": material_analysis.get("cluster_atom_data", [])[:50],
            "predicted_properties": predicted_properties,
            "degradation_pathway": [
                "Hydrolysis of polymer chains",
                "Microbial breakdown of oligomers",
                "Mineralization to CO2 and H2O",
                "Complete biodegradation"
            ],
            "manufacturing_process": manufacturing_steps,
            "cost_analysis": cost_analysis,
            "environmental_benefits": environmental_benefits,
            "performance_metrics": performance_metrics
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

# --- API Endpoints ---

@app.get("/", summary="Root endpoint")
async def root():
    return {
        "message": "Rwanda Quantum Agricultural Intelligence Platform",
        "version": "2.0.0",
        "status": "operational",
        "hackathon": "NISR 2025 Big Data Hackathon"
    }

@app.get("/health", summary="Health Check")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/generate_hackathon_dashboard_data", summary="Generate Hackathon Dashboard Data")
async def get_dashboard_data_endpoint():
    """Retrieves comprehensive data for the frontend hackathon dashboard"""
    try:
        data = generate_hackathon_dashboard_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/design_molecular_pesticide", response_model=MolecularPesticideResponse, summary="Design Quantum-Optimized Pesticides")
async def design_molecular_pesticide_endpoint(request: MolecularPesticideRequest):
    """Revolutionary approach: Uses quantum molecular simulation to design targeted, biodegradable pesticides"""
    try:
        result = design_molecular_pesticide(request)
        return MolecularPesticideResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/design_nutrient_enhancement", response_model=NutrientEnhancementResponse, summary="Molecular Nutrition Enhancement")
async def design_nutrient_enhancement_endpoint(request: NutrientEnhancementRequest):
    """Addresses Track 2 (Hidden Hunger): Uses molecular simulation to design compounds that enhance nutrient bioavailability"""
    try:
        result = design_nutrient_enhancement(request)
        return NutrientEnhancementResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/design_sustainable_material", response_model=SustainableMaterialResponse, summary="Quantum-Designed Agricultural Materials")
async def design_sustainable_material_endpoint(request: SustainableMaterialRequest):
    """Revolutionary material design: Uses quantum material properties prediction to design sustainable agricultural materials"""
    try:
        result = design_sustainable_agricultural_material(request)
        return SustainableMaterialResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate", summary="Core Quantum Molecular Simulation")
async def run_simulation_endpoint(request: dict):
    """Your original quantum/classical molecular simulation endpoint"""
    try:
        from pydantic import BaseModel
        class SimRequest(BaseModel):
            molecule_string: str = "H 0 0 0; H 0 0 0.74"
            method: str = "vqe"
            bond_distance_scale: float = 1.0
            
        sim_request = SimRequest(**request)
        results = run_molecule_simulation(
            sim_request.molecule_string,
            sim_request.method,
            sim_request.bond_distance_scale
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/molecular_docking", summary="Molecular Docking Analysis")
async def molecular_docking_endpoint(request: MolecularDockingAnalysisRequest):
    """Your original molecular docking, now applied to agricultural compounds"""
    try:
        if request.target_site == "pest_receptor":
            protein_site = "C 0 0 0; N 1.5 0 0; O 0 1.5 0; S -1.5 0 0"
        elif request.target_site == "nutrient_carrier":
            protein_site = "C 0 0 0; N 2.0 0 0; O 0 2.0 0; P -2.0 0 0"
        else:
            protein_site = "C 0 0 0; C 1.4 0 0; O 2.8 0 0; N 1.4 1.4 0"
            
        results = simplified_molecular_docking(
            request.compound_string,
            protein_site,
            num_poses=5
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- New Molecular Database Endpoints ---

@app.post("/upload_molecule", response_model=MoleculeUploadResponse, summary="Upload Molecule to Database")
async def upload_molecule_endpoint(request: MoleculeUploadRequest):
    """Upload a molecule to the database for storage and future use"""
    try:
        # Add molecule to database
        molecule_id = molecular_db.add_molecule(
            name=request.name,
            molecule_string=request.molecule_string,
            category=request.category,
            description=request.description
        )
        
        # Get molecular properties
        molecule_data = molecular_db.get_molecule(molecule_id)
        
        return MoleculeUploadResponse(
            success=True,
            molecule_id=molecule_id,
            message=f"Molecule '{request.name}' uploaded successfully",
            molecular_properties={
                "molecular_weight": molecule_data.get("molecular_weight"),
                "num_atoms": molecule_data.get("num_atoms"),
                "category": molecule_data.get("category")
            }
        )
    except Exception as e:
        return MoleculeUploadResponse(
            success=False,
            message="Failed to upload molecule",
            error=str(e)
        )

@app.post("/upload_molecule_file", summary="Upload Molecule File")
async def upload_molecule_file_endpoint(file: UploadFile = File(...), 
                                       name: str = None, 
                                       category: str = "general",
                                       description: str = None):
    """Upload molecule from file (SDF, MOL, XYZ, PDB formats)"""
    try:
        # Save uploaded file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Add molecule from file
            molecule_id = molecular_db.add_molecule_from_file(
                file_path=temp_file_path,
                name=name or file.filename.split('.')[0],
                category=category,
                description=description
            )
            
            # Get molecular properties
            molecule_data = molecular_db.get_molecule(molecule_id)
            
            return {
                "success": True,
                "molecule_id": molecule_id,
                "message": f"Molecule file '{file.filename}' uploaded successfully",
                "molecular_properties": {
                    "molecular_weight": molecule_data.get("molecular_weight"),
                    "num_atoms": molecule_data.get("num_atoms"),
                    "category": molecule_data.get("category"),
                    "file_format": molecule_data.get("file_format")
                }
            }
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search_molecules", summary="Search Molecules in Database")
async def search_molecules_endpoint(request: MoleculeSearchRequest):
    """Search for molecules in the database"""
    try:
        molecules = molecular_db.search_molecules(
            query=request.query,
            category=request.category,
            min_atoms=request.min_atoms,
            max_atoms=request.max_atoms
        )
        
        # Limit results
        limited_molecules = molecules[:request.limit]
        
        return {
            "success": True,
            "total_found": len(molecules),
            "returned_count": len(limited_molecules),
            "molecules": limited_molecules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/molecule/{molecule_id}", summary="Get Molecule Details")
async def get_molecule_endpoint(molecule_id: int):
    """Get detailed information about a specific molecule"""
    try:
        molecule = molecular_db.get_molecule(molecule_id)
        
        if not molecule:
            raise HTTPException(status_code=404, detail="Molecule not found")
        
        return {
            "success": True,
            "molecule": molecule
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate_molecule/{molecule_id}", summary="Run Simulation on Stored Molecule")
async def simulate_molecule_endpoint(molecule_id: int, method: str = "hf"):
    """Run quantum simulation on a molecule stored in the database"""
    try:
        result = molecular_db.run_and_cache_simulation(molecule_id, method)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Sub-Atomic Design Endpoints ---

@app.post("/design_sub_atomic_material", response_model=SubAtomicDesignResponse, summary="Sub-Atomic Material Design")
async def design_sub_atomic_material_endpoint(request: SubAtomicDesignRequest):
    """Design materials at sub-atomic level for specific agricultural applications"""
    try:
        # Get base molecule
        base_molecule = molecular_db.get_molecule(request.base_molecule_id)
        if not base_molecule:
            raise HTTPException(status_code=404, detail="Base molecule not found")
        
        # Create material target
        target = MaterialTarget(
            strength=request.target_strength,
            flexibility=request.target_flexibility,
            biodegradability=request.target_biodegradability,
            uv_resistance=request.target_uv_resistance,
            water_resistance=request.target_water_resistance,
            cost_effectiveness=request.target_cost_effectiveness,
            environmental_safety=request.target_environmental_safety,
            agricultural_suitability=request.target_agricultural_suitability
        )
        
        # Run sub-atomic design
        design_result = sub_atomic_designer.design_material(
            base_molecule['molecule_string'],
            target,
            max_iterations=request.max_iterations
        )
        
        # Store designed molecule in database
        if design_result['success']:
            designed_molecule_id = molecular_db.add_molecule(
                name=f"SubAtomic_Design_{request.base_molecule_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                molecule_string=design_result['designed_molecule'],
                category="sub_atomic_designed",
                description=f"Sub-atomic designed material based on molecule {request.base_molecule_id}"
            )
            
            return SubAtomicDesignResponse(
                success=True,
                original_molecule_id=request.base_molecule_id,
                designed_molecule_id=designed_molecule_id,
                design_results=design_result,
                fitness_score=design_result.get('fitness_score'),
                design_iterations=design_result.get('design_iterations'),
                recommendations=design_result.get('design_recommendations')
            )
        else:
            return SubAtomicDesignResponse(
                success=False,
                error="Sub-atomic design failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        return SubAtomicDesignResponse(
            success=False,
            error=str(e)
        )

@app.post("/create_molecular_library", summary="Create Molecular Design Library")
async def create_molecular_library_endpoint(request: MolecularLibraryRequest):
    """Create a library of designed materials for different agricultural applications"""
    try:
        # Create material targets based on applications
        targets = []
        
        for app in request.applications:
            if app == "packaging":
                target = MaterialTarget(
                    strength=0.8,
                    flexibility=0.4,
                    biodegradability=0.6,
                    uv_resistance=0.7,
                    water_resistance=0.8,
                    cost_effectiveness=0.7,
                    environmental_safety=0.9,
                    agricultural_suitability=0.8
                )
            elif app == "mulch":
                target = MaterialTarget(
                    strength=0.5,
                    flexibility=0.6,
                    biodegradability=0.9,
                    uv_resistance=0.8,
                    water_resistance=0.3,
                    cost_effectiveness=0.8,
                    environmental_safety=0.9,
                    agricultural_suitability=0.9
                )
            elif app == "irrigation":
                target = MaterialTarget(
                    strength=0.7,
                    flexibility=0.8,
                    biodegradability=0.4,
                    uv_resistance=0.9,
                    water_resistance=0.9,
                    cost_effectiveness=0.6,
                    environmental_safety=0.8,
                    agricultural_suitability=0.7
                )
            else:
                # Default balanced target
                target = MaterialTarget()
            
            # Apply custom requirements
            for prop, value in request.performance_requirements.items():
                if hasattr(target, prop):
                    setattr(target, prop, value)
            
            targets.append(target)
        
        # Create molecular library
        library = sub_atomic_designer.create_molecular_library(
            request.base_molecules,
            targets
        )
        
        return {
            "success": True,
            "library": library
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/database_stats", summary="Get Database Statistics")
async def get_database_stats_endpoint():
    """Get statistics about the molecular database"""
    try:
        stats = molecular_db.get_database_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Rwanda-Specific Agricultural Endpoints ---

@app.post("/initialize_rwanda_molecules", summary="Initialize Rwanda Demo Molecules")
async def initialize_rwanda_molecules_endpoint():
    """Initialize the database with Rwanda-relevant agricultural molecules"""
    try:
        added_molecules = initialize_rwanda_demo_molecules()
        return {
            "success": True,
            "message": f"Successfully initialized {len(added_molecules)} Rwanda-relevant molecules",
            "added_molecules": added_molecules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rwanda_demo_molecules", summary="Get Rwanda Demo Molecules")
async def get_rwanda_demo_molecules_endpoint():
    """Get information about all available Rwanda-relevant demo molecules"""
    try:
        return {
            "success": True,
            "total_molecules": len(RWANDA_DEMO_MOLECULES),
            "molecules": RWANDA_DEMO_MOLECULES
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rwanda_agricultural_recommendations", response_model=RwandaRecommendationResponse, summary="Get Rwanda Agricultural Recommendations")
async def get_rwanda_recommendations_endpoint(request: RwandaRecommendationRequest):
    """Get molecular recommendations based on Rwanda agricultural needs"""
    try:
        recommendations = get_rwanda_agricultural_recommendations(
            crop_type=request.crop_type,
            pest_issue=request.pest_issue,
            nutrient_deficiency=request.nutrient_deficiency
        )
        
        # Add location-specific notes based on district
        location_notes = []
        if request.district:
            if request.district.lower() in ["musanze", "burera", "gakenke", "gicumbi", "rulindo"]:
                location_notes.append("Northern Province: Ideal for potato and tea cultivation")
                location_notes.append("High altitude region - consider cold-resistant formulations")
            elif request.district.lower() in ["huye", "nyanza", "muhanga"]:
                location_notes.append("Southern Province: Major coffee growing region")
                location_notes.append("Focus on coffee berry borer prevention")
            elif request.district.lower() in ["nyagatare", "gatsibo", "kayonza"]:
                location_notes.append("Eastern Province: Major maize and beans production")
                location_notes.append("Fall armyworm is a significant threat in this region")
        
        return RwandaRecommendationResponse(
            success=True,
            recommendations=recommendations,
            total_recommendations=len(recommendations),
            location_specific_notes=location_notes if location_notes else None
        )
    except Exception as e:
        return RwandaRecommendationResponse(
            success=False,
            recommendations=[],
            total_recommendations=0,
            error=str(e)
        )

@app.get("/rwanda_molecule_statistics", response_model=RwandaMoleculeStatsResponse, summary="Get Rwanda Molecule Statistics")
async def get_rwanda_molecule_statistics_endpoint():
    """Get statistics about Rwanda-relevant molecules in the database"""
    try:
        stats = get_rwanda_molecule_statistics()
        return RwandaMoleculeStatsResponse(
            success=True,
            total_rwanda_molecules=stats["total_rwanda_molecules"],
            by_category=stats["by_category"],
            applications_coverage=stats["applications_coverage"],
            molecules_by_crop=stats["molecules_by_crop"]
        )
    except Exception as e:
        return RwandaMoleculeStatsResponse(
            success=False,
            total_rwanda_molecules=0,
            by_category={},
            applications_coverage={},
            molecules_by_crop={},
            error=str(e)
        )

@app.get("/rwanda_crop_pest_matrix", summary="Get Rwanda Crop-Pest-Solution Matrix")
async def get_rwanda_crop_pest_matrix_endpoint():
    """Get a comprehensive matrix of Rwanda crops, pests, and molecular solutions"""
    try:
        matrix = {
            "maize": {
                "major_pests": ["fall_armyworm", "stalk_borer"],
                "recommended_molecules": ["Azadirachtin (Neem Oil Active)"],
                "nutrient_needs": ["Urea"],
                "seasonal_considerations": ["Season A", "Season B"]
            },
            "coffee": {
                "major_pests": ["coffee_berry_borer", "coffee_leaf_rust"],
                "recommended_molecules": ["Pyrethrin I", "Caffeine"],
                "nutrient_needs": ["Potassium Chloride (Muriate of Potash)"],
                "seasonal_considerations": ["Year-round", "Harvest season critical"]
            },
            "beans": {
                "major_pests": ["bean_stem_maggot", "aphids"],
                "recommended_molecules": ["Azadirachtin (Neem Oil Active)", "Iron-EDTA Chelate"],
                "nutrient_needs": ["Iron-EDTA Chelate"],
                "seasonal_considerations": ["Season A", "Season B"]
            },
            "tea": {
                "major_pests": ["tea_mosquito_bug", "thrips"],
                "recommended_molecules": ["Pyrethrin I"],
                "nutrient_needs": ["Potassium Chloride (Muriate of Potash)"],
                "seasonal_considerations": ["Year-round harvesting"]
            },
            "cassava": {
                "major_pests": ["cassava_mosaic_virus", "cassava_mealybug"],
                "recommended_molecules": ["Iron-EDTA Chelate"],
                "nutrient_needs": ["Iron-EDTA Chelate", "Urea"],
                "seasonal_considerations": ["Season A", "Season B", "Season C"]
            },
            "potato": {
                "major_pests": ["potato_late_blight", "potato_tuber_moth"],
                "recommended_molecules": ["Pyrethrin I"],
                "nutrient_needs": ["Urea", "Potassium Chloride (Muriate of Potash)"],
                "seasonal_considerations": ["Season B", "Season C"]
            }
        }
        
        return {
            "success": True,
            "crop_pest_matrix": matrix,
            "total_crops": len(matrix),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Advanced Simulation Endpoints ---

@app.post("/run_bond_scan", summary="Run Bond Distance Scan")
async def run_bond_scan_endpoint(request: dict):
    """Run a bond distance scan analysis"""
    try:
        result = run_bond_scan(
            molecule_string=request.get("molecule_string"),
            atom_indices=request.get("atom_indices"),
            start_distance=request.get("start_distance"),
            end_distance=request.get("end_distance"),
            steps=request.get("steps"),
            method=request.get("method", "hf")
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize_geometry", summary="Optimize Molecular Geometry")
async def optimize_geometry_endpoint(request: dict):
    """Find the optimized molecular geometry"""
    try:
        result = find_optimized_geometry(
            molecule_string=request.get("molecule_string"),
            method=request.get("method", "hf")
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/find_transition_state", summary="Find Transition State")
async def find_transition_state_endpoint(request: dict):
    """Find transition state between reactants and products"""
    try:
        result = find_transition_state(
            reactant_string=request.get("reactant_string"),
            product_string=request.get("product_string")
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_material_properties", summary="Predict Material Properties")
async def predict_material_properties_endpoint(request: dict):
    """Predict bulk material properties from molecular structure"""
    try:
        result = predict_material_properties(
            molecule_string=request.get("molecule_string"),
            num_repeats=request.get("num_repeats", 2)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- GIS Data Endpoints ---

@app.get("/gis/districts", summary="Get Rwanda Districts GeoJSON")
async def get_gis_districts():
    """
    Get GeoJSON data for all Rwanda districts.
    
    Returns a FeatureCollection with district polygons and properties.
    Used for GIS map visualization and district selection.
    """
    try:
        import os
        # Try districts file first, fall back to sectors
        gis_file = os.path.join(os.path.dirname(__file__), "processed_gis", "rwanda_districts.geojson")
        if not os.path.exists(gis_file):
            gis_file = os.path.join(os.path.dirname(__file__), "processed_gis", "rwanda_sectors.geojson")
        
        if not os.path.exists(gis_file):
            raise HTTPException(status_code=404, detail="GIS data file not found")
        
        with open(gis_file, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
        
        # Process features to add computed properties (bounds, centroid)
        for feature in geojson_data.get("features", []):
            if feature.get("geometry", {}).get("type") == "Polygon":
                coords = feature["geometry"]["coordinates"][0]
                lons = [c[0] for c in coords]
                lats = [c[1] for c in coords]
                
                # Add bounding box
                feature["properties"]["bbox"] = {
                    "minLon": min(lons),
                    "maxLon": max(lons),
                    "minLat": min(lats),
                    "maxLat": max(lats)
                }
                
                # Add centroid
                feature["properties"]["centroid"] = {
                    "lon": (min(lons) + max(lons)) / 2,
                    "lat": (min(lats) + max(lats)) / 2
                }
        
        return {
            "success": True,
            "type": "FeatureCollection",
            "features": geojson_data.get("features", []),
            "total_districts": len(geojson_data.get("features", []))
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="GIS data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid GeoJSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading GIS data: {str(e)}")

@app.get("/gis/district/{district_name}", summary="Get Specific District GeoJSON")
async def get_gis_district(district_name: str):
    """
    Get GeoJSON data for a specific Rwanda district by name.
    
    Args:
        district_name: Name of the district (e.g., "Kigali", "Nyamagabe")
    
    Returns the district polygon with properties including bounds and centroid.
    """
    try:
        import os
        # Try districts file first, fall back to sectors
        gis_file = os.path.join(os.path.dirname(__file__), "processed_gis", "rwanda_districts.geojson")
        if not os.path.exists(gis_file):
            gis_file = os.path.join(os.path.dirname(__file__), "processed_gis", "rwanda_sectors.geojson")
        
        if not os.path.exists(gis_file):
            raise HTTPException(status_code=404, detail="GIS data file not found")
        
        with open(gis_file, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
        
        # Find district by NAME_2 property
        for feature in geojson_data.get("features", []):
            if feature.get("properties", {}).get("NAME_2", "").lower() == district_name.lower():
                if feature.get("geometry", {}).get("type") == "Polygon":
                    coords = feature["geometry"]["coordinates"][0]
                    lons = [c[0] for c in coords]
                    lats = [c[1] for c in coords]
                    
                    # Add bounding box
                    feature["properties"]["bbox"] = {
                        "minLon": min(lons),
                        "maxLon": max(lons),
                        "minLat": min(lats),
                        "maxLat": max(lats)
                    }
                    
                    # Add centroid
                    feature["properties"]["centroid"] = {
                        "lon": (min(lons) + max(lons)) / 2,
                        "lat": (min(lats) + max(lats)) / 2
                    }
                
                return {
                    "success": True,
                    "feature": feature
                }
        
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading GIS data: {str(e)}")

# --- AI Chatbot Agent Endpoints ---

@app.get("/ai/info", summary="Get AI Agent Information")
async def get_ai_agent_info():
    """Get information about the AI chatbot agent"""
    return get_agent_info()

@app.post("/ai/chat", summary="Chat with AI Agent", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the AI agriculture assistant
    
    The agent can:
    - Explain quantum agriculture concepts
    - Provide region-specific recommendations
    - Guide users through simulations
    - Suggest molecule designs
    - Answer farming questions
    """
    try:
        response = await process_chat_message(
            message=request.message,
            history=request.conversation_history,
            context=request.context
        )
        return response
    except Exception as e:
        return ChatResponse(
            message=f"Error processing request: {str(e)}",
            timestamp=datetime.now().isoformat()
        )

@app.post("/ai/agriculture-info", summary="Get Agricultural Information")
async def get_agriculture_information(query: str):
    """
    Get information about crops, pests, or quantum concepts
    
    Examples:
    - "coffee pests"
    - "fall armyworm"
    - "bond scanning"
    - "geometry optimization"
    """
    try:
        agent = AIAgent()
        info = agent.get_agriculture_info(query)
        
        if info:
            return {
                "success": True,
                "query": query,
                "type": info["type"],
                "data": info["data"]
            }
        else:
            return {
                "success": False,
                "query": query,
                "message": "No information found for this query"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/crops", summary="List Available Crops")
async def get_available_crops():
    """Get list of crops with agricultural information"""
    try:
        agent = AIAgent()
        crops = agent.agriculture_knowledge["crops"]
        return {
            "success": True,
            "crops": list(crops.keys()),
            "total": len(crops),
            "details": crops
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/pests", summary="List Available Pests")
async def get_available_pests():
    """Get list of pests with control information"""
    try:
        agent = AIAgent()
        pests = agent.agriculture_knowledge["pesticides"]
        return {
            "success": True,
            "pests": list(pests.keys()),
            "total": len(pests),
            "details": pests
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/concepts", summary="List Quantum Concepts")
async def get_quantum_concepts():
    """Get list of quantum computing concepts explained for agriculture"""
    try:
        agent = AIAgent()
        concepts = agent.agriculture_knowledge["quantum_concepts"]
        return {
            "success": True,
            "concepts": list(concepts.keys()),
            "total": len(concepts),
            "details": concepts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/districts", summary="List Rwanda Districts")
async def get_rwanda_districts():
    """Get list of all Rwanda districts for regional recommendations"""
    try:
        agent = AIAgent()
        districts = agent.agriculture_knowledge["rwandan_districts"]
        return {
            "success": True,
            "districts": districts,
            "total": len(districts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
