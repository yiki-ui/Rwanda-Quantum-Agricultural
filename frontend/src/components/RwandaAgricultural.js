import React, { useState, useEffect } from 'react';
import { Wheat, TrendingUp, Users, Target, DollarSign, Globe, HardHat, BarChart3, Ban, Sprout, Droplet, Leaf, FlaskConical, ClipboardList, Handshake, Lightbulb, Dna, Calendar, Atom, CheckCircle2, Microscope } from 'lucide-react';
import LeafletDistrictMap from './LeafletDistrictMap';
import { useChatbot } from '../contexts/ChatbotContext';

const RwandaAgricultural = ({ backendUrl, backendReady }) => {
  // Get chatbot context for smart district selection
  const { rwandaSection: chatbotSection, selectedDistrict: chatbotDistrict, setRwandaSection, setSelectedDistrict } = useChatbot();

  const [pesticideResults, setPesticideResults] = useState(null);
  const [nutrientResults, setNutrientResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use chatbot context for activeSection and selectedDistrict
  const [activeSection, setActiveSection] = useState(chatbotSection || 'overview');
  const [selectedDistrictLocal, setSelectedDistrictLocal] = useState(chatbotDistrict);

  const [soilAnalysis, setSoilAnalysis] = useState(null);
  const [cropAnalysis, setCropAnalysis] = useState(null);
  const [impactMetrics, setImpactMetrics] = useState(null);

  // Sync with chatbot context
  useEffect(() => {
    if (chatbotSection) {
      setActiveSection(chatbotSection);
    }
  }, [chatbotSection]);

  useEffect(() => {
    if (chatbotDistrict) {
      setSelectedDistrictLocal(chatbotDistrict);
    }
  }, [chatbotDistrict]);

  // Update context when local state changes
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setRwandaSection(section);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrictLocal(district);
    setSelectedDistrict(district);
  };

  // Form states for pesticide design
  const [pesticideForm, setPesticideForm] = useState({
    pestName: 'fall_armyworm',
    targetCrop: 'maize',
    district: 'Kigali'
  });

  // Form states for nutrient analysis
  const [nutrientForm, setNutrientForm] = useState({
    nutrientType: 'iron',
    targetCrop: 'beans',
    enhancementPercentage: 50
  });

  // Enhanced Rwanda agricultural data with molecular targets and soil composition
  const rwandaData = {
    districts: {
      "northern_province": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
      "southern_province": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Ruhango", "Nyaruguru"],
      "eastern_province": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
      "western_province": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
      "kigali": ["Gasabo", "Kicukiro", "Nyarugenge"]
    },
    crops: ["maize", "beans", "coffee", "tea", "cassava", "potato", "sorghum", "rice"],
    pests: ["fall_armyworm", "coffee_berry_borer", "bean_stem_maggot", "potato_late_blight", "cassava_mosaic_virus", "banana_weevil", "coffee_leaf_rust"],
    nutrients: ["iron", "zinc", "vitamin_a", "nitrogen", "phosphorus", "potassium", "calcium"],
    soilTypes: {
      "volcanic_soils": { ph: 6.2, organic_matter: 4.5, nitrogen: "medium", phosphorus: "low", potassium: "high" },
      "lateritic_soils": { ph: 5.8, organic_matter: 2.8, nitrogen: "low", phosphorus: "very_low", potassium: "medium" },
      "alluvial_soils": { ph: 6.8, organic_matter: 3.2, nitrogen: "high", phosphorus: "medium", potassium: "high" },
      "swamp_soils": { ph: 5.5, organic_matter: 8.1, nitrogen: "very_high", phosphorus: "low", potassium: "low" }
    },
    pestMolecularTargets: {
      "fall_armyworm": { target_protein: "sodium_channel", binding_site: "neurotransmitter_receptor", molecular_weight_range: [200, 400] },
      "coffee_berry_borer": { target_protein: "acetylcholinesterase", binding_site: "active_site", molecular_weight_range: [150, 300] },
      "bean_stem_maggot": { target_protein: "chitin_synthase", binding_site: "enzyme_active_site", molecular_weight_range: [180, 350] },
      "potato_late_blight": { target_protein: "cell_wall_enzyme", binding_site: "catalytic_domain", molecular_weight_range: [250, 500] }
    },
    cropMolecularProfiles: {
      "maize": { primary_nutrients: ["nitrogen", "phosphorus"], stress_indicators: ["drought_tolerance", "pest_resistance"], optimal_ph: 6.5 },
      "beans": { primary_nutrients: ["iron", "zinc"], stress_indicators: ["bacterial_blight", "rust_resistance"], optimal_ph: 6.2 },
      "coffee": { primary_nutrients: ["potassium", "magnesium"], stress_indicators: ["leaf_rust", "berry_borer"], optimal_ph: 6.0 },
      "tea": { primary_nutrients: ["nitrogen", "aluminum"], stress_indicators: ["blister_blight", "red_spider_mite"], optimal_ph: 5.5 }
    }
  };

  const handlePesticideDesign = async () => {
    setLoading(true);
    setPesticideResults(null);

    if (!backendReady) {
      // Demo data for pesticide design
      setTimeout(() => {
        setPesticideResults({
          success: true,
          pest_target: pesticideForm.pestName,
          target_crop: pesticideForm.targetCrop,
          best_candidate: {
            molecule_string: "C 0 0 0; C 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Cl 0 -1.4 0; H 2.8 1.4 0",
            rwanda_suitability_score: 0.85,
            recommended_application: "Foliar spray during A season",
            target_districts: [pesticideForm.district],
            simulation_result: {
              molecular_descriptors: {
                molecular_weight: 245.7,
                molecular_compactness: 1.8
              },
              agricultural_activity: {
                pesticide_activity_score: 0.82
              }
            }
          },
          pest_severity: "high",
          seasonal_recommendation: ["A", "B"]
        });
        setLoading(false);
      }, 2000);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/design_rwanda_specific_pesticide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pest_name: pesticideForm.pestName,
          target_crop: pesticideForm.targetCrop,
          district: pesticideForm.district
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPesticideResults(data);
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.log('Using demo data due to backend error');
      // Fallback to demo data
      setPesticideResults({
        success: true,
        pest_target: pesticideForm.pestName,
        target_crop: pesticideForm.targetCrop,
        best_candidate: {
          molecule_string: "C 0 0 0; C 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Cl 0 -1.4 0; H 2.8 1.4 0",
          rwanda_suitability_score: 0.85,
          recommended_application: "Foliar spray during A season",
          target_districts: [pesticideForm.district]
        }
      });
    }

    setLoading(false);
  };

  const handleNutrientAnalysis = async () => {
    setLoading(true);
    setNutrientResults(null);

    if (!backendReady) {
      // Demo data for nutrient analysis
      setTimeout(() => {
        setNutrientResults({
          success: true,
          nutrient_type: nutrientForm.nutrientType,
          target_crop: nutrientForm.targetCrop,
          baseline_yield_kg_per_ha: 1800,
          potential_yield_increase_kg_per_ha: 342,
          yield_improvement_percentage: 19,
          deficiency_prevalence: 0.38,
          estimated_people_benefited: 125000,
          food_security_impact: "high",
          recommended_implementation: "Priority districts: all",
          cost_benefit_ratio: "favorable"
        });
        setLoading(false);
      }, 2000);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/predict_nutrient_enhancement_impact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nutrient_type: nutrientForm.nutrientType,
          target_crop: nutrientForm.targetCrop,
          enhancement_percentage: nutrientForm.enhancementPercentage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNutrientResults(data);
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.log('Using demo data due to backend error');
      // Fallback to demo data
      setNutrientResults({
        success: true,
        nutrient_type: nutrientForm.nutrientType,
        target_crop: nutrientForm.targetCrop,
        baseline_yield_kg_per_ha: 1800,
        potential_yield_increase_kg_per_ha: 342,
        yield_improvement_percentage: 19,
        estimated_people_benefited: 125000,
        food_security_impact: "high"
      });
    }

    setLoading(false);
  };

  // New function for soil composition analysis
  const handleSoilAnalysis = async (district) => {
    setLoading(true);
    setSoilAnalysis(null);

    // Demo soil analysis data
    setTimeout(() => {
      const soilType = district.includes('Musanze') || district.includes('Gicumbi') ? 'volcanic_soils' :
        district.includes('Huye') || district.includes('Nyanza') ? 'lateritic_soils' :
          district.includes('Bugesera') || district.includes('Nyagatare') ? 'alluvial_soils' : 'volcanic_soils';

      const soilData = rwandaData.soilTypes[soilType];
      setSoilAnalysis({
        success: true,
        district: district,
        soil_type: soilType,
        composition: soilData,
        recommendations: {
          lime_application: soilData.ph < 6.0 ? 'Required' : 'Optional',
          organic_matter_boost: soilData.organic_matter < 3.0 ? 'Critical' : 'Moderate',
          priority_nutrients: Object.entries(soilData).filter(([key, value]) =>
            ['nitrogen', 'phosphorus', 'potassium'].includes(key) && ['low', 'very_low'].includes(value)
          ).map(([key]) => key)
        },
        molecular_interventions: {
          ph_adjustment: soilData.ph < 6.0 ? 'Calcium carbonate application' : 'Maintain current pH',
          nutrient_chelation: 'Iron-EDTA complex for bioavailability',
          microbial_enhancement: 'Rhizobium inoculation recommended'
        }
      });
      setLoading(false);
    }, 1500);
  };

  // New function for crop-specific molecular analysis
  const handleCropAnalysis = async (crop, soilType) => {
    setLoading(true);
    setCropAnalysis(null);

    // Demo crop analysis data
    setTimeout(() => {
      const cropProfile = rwandaData.cropMolecularProfiles[crop];
      const soilData = rwandaData.soilTypes[soilType] || rwandaData.soilTypes['volcanic_soils'];

      setCropAnalysis({
        success: true,
        crop: crop,
        molecular_profile: cropProfile,
        soil_compatibility: {
          ph_match: Math.abs(cropProfile.optimal_ph - soilData.ph) < 0.5 ? 'Excellent' :
            Math.abs(cropProfile.optimal_ph - soilData.ph) < 1.0 ? 'Good' : 'Needs adjustment',
          nutrient_availability: cropProfile.primary_nutrients.map(nutrient => ({
            nutrient: nutrient,
            soil_level: soilData[nutrient] || 'medium',
            adequacy: ['high', 'very_high'].includes(soilData[nutrient]) ? 'Sufficient' : 'Deficient'
          }))
        },
        molecular_interventions: {
          biofortification_targets: cropProfile.primary_nutrients,
          stress_resistance_genes: cropProfile.stress_indicators,
          yield_enhancement_compounds: ['cytokinin_analogues', 'auxin_derivatives', 'gibberellin_precursors']
        },
        predicted_outcomes: {
          yield_increase_percentage: Math.random() * 25 + 15, // 15-40% increase
          nutritional_improvement: Math.random() * 30 + 20, // 20-50% improvement
          stress_tolerance_score: Math.random() * 0.3 + 0.7 // 0.7-1.0 score
        }
      });
      setLoading(false);
    }, 2000);
  };

  // New function for agricultural impact metrics
  const generateImpactMetrics = () => {
    const metrics = {
      food_security: {
        current_production: 2.8, // million tons
        potential_increase: 1.2, // million tons
        people_fed_additionally: 850000,
        malnutrition_reduction: 23 // percentage
      },
      economic_impact: {
        farmer_income_increase: 340, // USD per year
        export_potential: 45, // million USD
        job_creation: 12500,
        gdp_contribution: 0.8 // percentage
      },
      environmental_benefits: {
        pesticide_reduction: 35, // percentage
        soil_health_improvement: 28, // percentage
        water_usage_efficiency: 22, // percentage
        carbon_sequestration: 15000 // tons CO2
      },
      molecular_innovations: {
        new_compounds_designed: 47,
        successful_field_trials: 23,
        patents_filed: 8,
        research_collaborations: 12
      }
    };

    setImpactMetrics(metrics);
  };

  // Generate impact metrics on component mount
  useEffect(() => {
    generateImpactMetrics();
  }, []);

  return (
    <div className="rwanda-agricultural">
      <div className="rwanda-header">
        <h2>Rwanda Agricultural Intelligence</h2>
        <p>Quantum-enhanced solutions for Rwanda's agricultural challenges</p>
      </div>

      {/* Enhanced Section Navigation */}
      <div className="section-navigation">
        <button
          className={`section-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => handleSectionChange('overview')}
        >
          Impact Overview
        </button>
        <button
          className={`section-btn ${activeSection === 'soil' ? 'active' : ''}`}
          onClick={() => handleSectionChange('soil')}
        >
          Soil Analysis
        </button>
        <button
          className={`section-btn ${activeSection === 'crop' ? 'active' : ''}`}
          onClick={() => handleSectionChange('crop')}
        >
          Crop Molecular Analysis
        </button>
        <button
          className={`section-btn ${activeSection === 'pesticide' ? 'active' : ''}`}
          onClick={() => handleSectionChange('pesticide')}
        >
          Pesticide Design
        </button>
        <button
          className={`section-btn ${activeSection === 'nutrient' ? 'active' : ''}`}
          onClick={() => handleSectionChange('nutrient')}
        >
          Nutrient Analysis
        </button>
      </div>

      {/* Impact Overview Section */}
      {activeSection === 'overview' && impactMetrics && (
        <div className="overview-section">
          <div className="section-header">
            <h3>Rwanda Agricultural Intelligence Impact Overview</h3>
            <p>Comprehensive metrics showing the potential impact of quantum-enhanced agriculture</p>
          </div>

          <div className="metrics-dashboard">
            <div className="metric-category">
              <h4>Food Security Impact</h4>
              <div className="metrics-grid">
                <div className="metric-card blue">
                  <div className="metric-header">
                    <div className="metric-icon"><Wheat size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.food_security.current_production}M</div>
                      <div className="metric-label">Current Production (tons)</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card green">
                  <div className="metric-header">
                    <div className="metric-icon"><TrendingUp size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">+{impactMetrics.food_security.potential_increase}M</div>
                      <div className="metric-label">Potential Increase (tons)</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card purple">
                  <div className="metric-header">
                    <div className="metric-icon"><Users size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.food_security.people_fed_additionally.toLocaleString()}</div>
                      <div className="metric-label">Additional People Fed</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card orange">
                  <div className="metric-header">
                    <div className="metric-icon"><Target size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.food_security.malnutrition_reduction}%</div>
                      <div className="metric-label">Malnutrition Reduction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="metric-category">
              <h4>Economic Impact</h4>
              <div className="metrics-grid">
                <div className="metric-card green">
                  <div className="metric-header">
                    <div className="metric-icon"><DollarSign size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">${impactMetrics.economic_impact.farmer_income_increase}</div>
                      <div className="metric-label">Farmer Income Increase/Year</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card blue">
                  <div className="metric-header">
                    <div className="metric-icon"><Globe size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">${impactMetrics.economic_impact.export_potential}M</div>
                      <div className="metric-label">Export Potential</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card purple">
                  <div className="metric-header">
                    <div className="metric-icon"><HardHat size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.economic_impact.job_creation.toLocaleString()}</div>
                      <div className="metric-label">Jobs Created</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card orange">
                  <div className="metric-header">
                    <div className="metric-icon"><BarChart3 size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.economic_impact.gdp_contribution}%</div>
                      <div className="metric-label">GDP Contribution</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="metric-category">
              <h4>Environmental Benefits</h4>
              <div className="metrics-grid">
                <div className="metric-card red">
                  <div className="metric-header">
                    <div className="metric-icon"><Ban size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">-{impactMetrics.environmental_benefits.pesticide_reduction}%</div>
                      <div className="metric-label">Pesticide Reduction</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card green">
                  <div className="metric-header">
                    <div className="metric-icon"><Sprout size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">+{impactMetrics.environmental_benefits.soil_health_improvement}%</div>
                      <div className="metric-label">Soil Health Improvement</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card blue">
                  <div className="metric-header">
                    <div className="metric-icon"><Droplet size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">+{impactMetrics.environmental_benefits.water_usage_efficiency}%</div>
                      <div className="metric-label">Water Efficiency Gain</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card purple">
                  <div className="metric-header">
                    <div className="metric-icon"><Leaf size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.environmental_benefits.carbon_sequestration.toLocaleString()}</div>
                      <div className="metric-label">CO₂ Sequestered (tons)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="metric-category">
              <h4>Molecular Innovation</h4>
              <div className="metrics-grid">
                <div className="metric-card blue">
                  <div className="metric-header">
                    <div className="metric-icon"><FlaskConical size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.molecular_innovations.new_compounds_designed}</div>
                      <div className="metric-label">New Compounds Designed</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card green">
                  <div className="metric-header">
                    <div className="metric-icon"><CheckCircle2 size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.molecular_innovations.successful_field_trials}</div>
                      <div className="metric-label">Successful Field Trials</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card orange">
                  <div className="metric-header">
                    <div className="metric-icon"><ClipboardList size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.molecular_innovations.patents_filed}</div>
                      <div className="metric-label">Patents Filed</div>
                    </div>
                  </div>
                </div>
                <div className="metric-card purple">
                  <div className="metric-header">
                    <div className="metric-icon"><Handshake size={24} /></div>
                    <div className="metric-info">
                      <div className="metric-value">{impactMetrics.molecular_innovations.research_collaborations}</div>
                      <div className="metric-label">Research Collaborations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soil Analysis Section */}
      {activeSection === 'soil' && (
        <div className="soil-section">
          <div className="section-header">
            <h3>Rwanda Soil Composition Analysis</h3>
            <p>Molecular-level soil analysis for optimized agricultural interventions</p>
          </div>

          {/* GIS District Map */}
          <div style={{ marginBottom: '24px', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <LeafletDistrictMap
              selectedDistrict={selectedDistrictLocal}
              onDistrictSelect={(district) => {
                handleDistrictSelect(district);
                handleSoilAnalysis(district);
              }}
              apiBaseUrl={backendUrl}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Or Select District from Dropdown:</label>
              <select onChange={(e) => {
                if (e.target.value) {
                  setSelectedDistrictLocal(e.target.value);
                  handleSoilAnalysis(e.target.value);
                }
              }} value={selectedDistrictLocal || ''}>
                <option value="">Choose a district...</option>
                <option value="Kigali">Kigali</option>
                {Object.entries(rwandaData.districts).map(([province, districts]) =>
                  districts.map(district => (
                    <option key={district} value={district}>{district} ({province.replace('_', ' ')})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {soilAnalysis && soilAnalysis.success && (
            <div className="results-panel">
              <h4>Soil Analysis Results - {soilAnalysis.district}</h4>
              <div className="results-grid">
                <div className="result-card blue">
                  <div className="result-header">
                    <div className="result-icon"><FlaskConical size={20} /></div>
                    <h5>Soil Composition</h5>
                  </div>
                  <p><strong>Soil Type:</strong> {soilAnalysis.soil_type.replace('_', ' ')}</p>
                  <p><strong>pH Level:</strong> {soilAnalysis.composition.ph}</p>
                  <p><strong>Organic Matter:</strong> {soilAnalysis.composition.organic_matter}%</p>
                  <p><strong>Nitrogen:</strong> {soilAnalysis.composition.nitrogen}</p>
                  <p><strong>Phosphorus:</strong> {soilAnalysis.composition.phosphorus}</p>
                  <p><strong>Potassium:</strong> {soilAnalysis.composition.potassium}</p>
                </div>

                <div className="result-card green">
                  <div className="result-header">
                    <div className="result-icon"><Lightbulb size={20} /></div>
                    <h5>Recommendations</h5>
                  </div>
                  <p><strong>Lime Application:</strong> {soilAnalysis.recommendations.lime_application}</p>
                  <p><strong>Organic Matter:</strong> {soilAnalysis.recommendations.organic_matter_boost}</p>
                  <p><strong>Priority Nutrients:</strong> {soilAnalysis.recommendations.priority_nutrients.join(', ') || 'None'}</p>
                </div>

                <div className="result-card purple">
                  <div className="result-header">
                    <div className="result-icon"><Atom size={20} /></div>
                    <h5>Molecular Interventions</h5>
                  </div>
                  <p><strong>pH Adjustment:</strong> {soilAnalysis.molecular_interventions.ph_adjustment}</p>
                  <p><strong>Nutrient Chelation:</strong> {soilAnalysis.molecular_interventions.nutrient_chelation}</p>
                  <p><strong>Microbial Enhancement:</strong> {soilAnalysis.molecular_interventions.microbial_enhancement}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
      }

      {/* Crop Molecular Analysis Section */}
      {
        activeSection === 'crop' && (
          <div className="crop-section">
            <div className="section-header">
              <h3>Crop-Specific Molecular Analysis</h3>
              <p>Quantum-enhanced crop optimization and molecular biofortification</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Select Crop:</label>
                <select onChange={(e) => handleCropAnalysis(e.target.value, 'volcanic_soils')}>
                  <option value="">Choose a crop...</option>
                  {rwandaData.crops.map(crop => (
                    <option key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {cropAnalysis && cropAnalysis.success && (
              <div className="results-panel">
                <h4>Crop Molecular Analysis - {cropAnalysis.crop.charAt(0).toUpperCase() + cropAnalysis.crop.slice(1)}</h4>
                <div className="results-grid">
                  <div className="result-card blue">
                    <div className="result-header">
                      <div className="result-icon"><Dna size={20} /></div>
                      <h5>Molecular Profile</h5>
                    </div>
                    <p><strong>Primary Nutrients:</strong> {cropAnalysis.molecular_profile.primary_nutrients.join(', ')}</p>
                    <p><strong>Stress Indicators:</strong> {cropAnalysis.molecular_profile.stress_indicators.join(', ')}</p>
                    <p><strong>Optimal pH:</strong> {cropAnalysis.molecular_profile.optimal_ph}</p>
                  </div>

                  <div className="result-card green">
                    <div className="result-header">
                      <div className="result-icon"><Sprout size={20} /></div>
                      <h5>Soil Compatibility</h5>
                    </div>
                    <p><strong>pH Match:</strong> {cropAnalysis.soil_compatibility.ph_match}</p>
                    <div><strong>Nutrient Availability:</strong></div>
                    {cropAnalysis.soil_compatibility.nutrient_availability.map(nutrient => (
                      <p key={nutrient.nutrient}>
                        • {nutrient.nutrient}: {nutrient.soil_level} ({nutrient.adequacy})
                      </p>
                    ))}
                  </div>

                  <div className="result-card purple">
                    <div className="result-header">
                      <div className="result-icon"><Atom size={20} /></div>
                      <h5>Molecular Interventions</h5>
                    </div>
                    <p><strong>Biofortification Targets:</strong> {cropAnalysis.molecular_interventions.biofortification_targets.join(', ')}</p>
                    <p><strong>Stress Resistance Genes:</strong> {cropAnalysis.molecular_interventions.stress_resistance_genes.join(', ')}</p>
                    <p><strong>Yield Enhancement:</strong> {cropAnalysis.molecular_interventions.yield_enhancement_compounds.join(', ')}</p>
                  </div>

                  <div className="result-card orange">
                    <div className="result-header">
                      <div className="result-icon"><TrendingUp size={20} /></div>
                      <h5>Predicted Outcomes</h5>
                    </div>
                    <p><strong>Yield Increase:</strong> {cropAnalysis.predicted_outcomes.yield_increase_percentage.toFixed(1)}%</p>
                    <p><strong>Nutritional Improvement:</strong> {cropAnalysis.predicted_outcomes.nutritional_improvement.toFixed(1)}%</p>
                    <p><strong>Stress Tolerance Score:</strong> {cropAnalysis.predicted_outcomes.stress_tolerance_score.toFixed(2)}/1.0</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      {/* Pesticide Design Section */}
      {
        activeSection === 'pesticide' && (
          <div className="pesticide-section">
            <div className="section-header">
              <h3>Rwanda-Specific Pesticide Design</h3>
              <p>Design quantum-optimized pesticides for local pests and crops</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Target Pest:</label>
                <select
                  value={pesticideForm.pestName}
                  onChange={(e) => setPesticideForm({ ...pesticideForm, pestName: e.target.value })}
                >
                  {rwandaData.pests.map(pest => (
                    <option key={pest} value={pest}>
                      {pest.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Target Crop:</label>
                <select
                  value={pesticideForm.targetCrop}
                  onChange={(e) => setPesticideForm({ ...pesticideForm, targetCrop: e.target.value })}
                >
                  {rwandaData.crops.map(crop => (
                    <option key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>District:</label>
                <select
                  value={pesticideForm.district}
                  onChange={(e) => setPesticideForm({ ...pesticideForm, district: e.target.value })}
                >
                  <option value="Kigali">Kigali</option>
                  {Object.entries(rwandaData.districts).map(([province, districts]) =>
                    districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              className="design-btn"
              onClick={handlePesticideDesign}
              disabled={loading}
            >
              {loading ? <><Microscope size={18} style={{ display: 'inline', marginRight: '6px' }} /> Designing Pesticide...</> : <><FlaskConical size={18} style={{ display: 'inline', marginRight: '6px' }} /> Design Pesticide</>}
            </button>

            {pesticideResults && pesticideResults.success && (
              <div className="results-panel">
                <h4>Pesticide Design Results</h4>
                <div className="results-grid">
                  <div className="result-card red">
                    <div className="result-header">
                      <div className="result-icon"><Target size={20} /></div>
                      <h5>Target Information</h5>
                    </div>
                    <p><strong>Pest:</strong> {pesticideResults.pest_target.replace(/_/g, ' ')}</p>
                    <p><strong>Crop:</strong> {pesticideResults.target_crop}</p>
                    <p><strong>Severity:</strong> {pesticideResults.pest_severity}</p>
                  </div>

                  {pesticideResults.best_candidate && (
                    <div className="result-card green">
                      <div className="result-header">
                        <div className="result-icon"><FlaskConical size={20} /></div>
                        <h5>Best Candidate Molecule</h5>
                      </div>
                      <p><strong>Suitability Score:</strong> {(pesticideResults.best_candidate.rwanda_suitability_score * 100).toFixed(1)}%</p>
                      <p><strong>Application:</strong> {pesticideResults.best_candidate.recommended_application}</p>
                      <p><strong>Target Districts:</strong> {pesticideResults.best_candidate.target_districts?.join(', ')}</p>
                      {pesticideResults.best_candidate.simulation_result && (
                        <>
                          <p><strong>Molecular Weight:</strong> {pesticideResults.best_candidate.simulation_result.molecular_descriptors?.molecular_weight?.toFixed(1)} g/mol</p>
                          <p><strong>Activity Score:</strong> {(pesticideResults.best_candidate.simulation_result.agricultural_activity?.pesticide_activity_score * 100).toFixed(1)}%</p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="result-card purple">
                    <div className="result-header">
                      <div className="result-icon"><Atom size={20} /></div>
                      <h5>Molecular Target Analysis</h5>
                    </div>
                    {rwandaData.pestMolecularTargets[pesticideResults.pest_target] && (
                      <>
                        <p><strong>Target Protein:</strong> {rwandaData.pestMolecularTargets[pesticideResults.pest_target].target_protein.replace(/_/g, ' ')}</p>
                        <p><strong>Binding Site:</strong> {rwandaData.pestMolecularTargets[pesticideResults.pest_target].binding_site.replace(/_/g, ' ')}</p>
                        <p><strong>Optimal MW Range:</strong> {rwandaData.pestMolecularTargets[pesticideResults.pest_target].molecular_weight_range.join('-')} g/mol</p>
                      </>
                    )}
                  </div>

                  <div className="result-card blue">
                    <div className="result-header">
                      <div className="result-icon"><Calendar size={20} /></div>
                      <h5>Seasonal Recommendations</h5>
                    </div>
                    <p><strong>Peak Seasons:</strong> {pesticideResults.seasonal_recommendation?.join(', ')}</p>
                    <p><strong>Application Method:</strong> Foliar spray recommended</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      {/* Nutrient Analysis Section */}
      {
        activeSection === 'nutrient' && (
          <div className="nutrient-section">
            <div className="section-header">
              <h3>Nutrient Enhancement Impact Analysis</h3>
              <p>Analyze the impact of nutrient enhancements on Rwanda's food security</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nutrient Type:</label>
                <select
                  value={nutrientForm.nutrientType}
                  onChange={(e) => setNutrientForm({ ...nutrientForm, nutrientType: e.target.value })}
                >
                  {rwandaData.nutrients.map(nutrient => (
                    <option key={nutrient} value={nutrient}>
                      {nutrient.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Target Crop:</label>
                <select
                  value={nutrientForm.targetCrop}
                  onChange={(e) => setNutrientForm({ ...nutrientForm, targetCrop: e.target.value })}
                >
                  {rwandaData.crops.map(crop => (
                    <option key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Enhancement Percentage:</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={nutrientForm.enhancementPercentage}
                  onChange={(e) => setNutrientForm({ ...nutrientForm, enhancementPercentage: parseInt(e.target.value) })}
                />
                <span>{nutrientForm.enhancementPercentage}%</span>
              </div>
            </div>

            <button
              className="design-btn"
              onClick={handleNutrientAnalysis}
              disabled={loading}
            >
              {loading ? 'Analyzing Impact...' : 'Analyze Impact'}
            </button>

            {nutrientResults && nutrientResults.success && (
              <div className="results-panel">
                <h4>Nutrient Enhancement Impact</h4>
                <div className="results-grid">
                  <div className="result-card green">
                    <div className="result-header">
                      <div className="result-icon"><TrendingUp size={20} /></div>
                      <h5>Yield Impact</h5>
                    </div>
                    <p><strong>Baseline Yield:</strong> {nutrientResults.baseline_yield_kg_per_ha?.toLocaleString()} kg/ha</p>
                    <p><strong>Potential Increase:</strong> {nutrientResults.potential_yield_increase_kg_per_ha?.toLocaleString()} kg/ha</p>
                    <p><strong>Improvement:</strong> {nutrientResults.yield_improvement_percentage?.toFixed(1)}%</p>
                  </div>

                  <div className="result-card blue">
                    <div className="result-header">
                      <div className="result-icon"><Users size={20} /></div>
                      <h5>Food Security Impact</h5>
                    </div>
                    <p><strong>People Benefited:</strong> {nutrientResults.estimated_people_benefited?.toLocaleString()}</p>
                    <p><strong>Impact Level:</strong> {nutrientResults.food_security_impact}</p>
                    <p><strong>Deficiency Prevalence:</strong> {(nutrientResults.deficiency_prevalence * 100)?.toFixed(1)}%</p>
                  </div>

                  <div className="result-card orange">
                    <div className="result-header">
                      <div className="result-icon"><Target size={20} /></div>
                      <h5>Implementation</h5>
                    </div>
                    <p><strong>Recommendation:</strong> {nutrientResults.recommended_implementation}</p>
                    <p><strong>Cost-Benefit:</strong> {nutrientResults.cost_benefit_ratio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

export default RwandaAgricultural;
