import React, { useState, useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import MolecularDatabase from './components/MolecularDatabase';
import EnhancedMolecularDatabase from './components/EnhancedMolecularDatabase';
import SubAtomicDesigner from './components/SubAtomicDesigner';
import AdvancedSimulations from './components/AdvancedSimulations';
import RwandaAgricultural from './components/RwandaAgricultural';
import Analytics from './components/Analytics';
import PaymentTab from './components/PaymentTab';
import AIAssistant from './components/AIAssistant';
import OfflineIndicator from './components/OfflineIndicator';
import { ChatbotProvider } from './contexts/ChatbotContext';
import './App.css';
import './components/EnhancedMolecularDatabase.css';

function App() {
  const [selectedMolecule, setSelectedMolecule] = useState('water');
  const [simulationResults, setSimulationResults] = useState(null);
  const [pesticideDesign, setPesticideDesign] = useState(null);
  const [nutrientDesign, setNutrientDesign] = useState(null);
  const [materialDesign, setMaterialDesign] = useState(null);
  const [dockingResults, setDockingResults] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [backendWaking, setBackendWaking] = useState(false);

  // New state for molecular database and sub-atomic design
  const [selectedDatabaseMolecule, setSelectedDatabaseMolecule] = useState(null);
  const [subAtomicDesignResult, setSubAtomicDesignResult] = useState(null);
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation', 'database', 'designer', 'advanced', 'rwanda', 'analytics', 'payment'

  // Ref to AdvancedSimulations component for chatbot control
  const advancedSimulationsRef = useRef(null);

  const BACKEND_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://rwanda-quantum-backend.onrender.com';
  const WAKE_TIMEOUT = 60000; // 60 seconds for initial wake
  const SIMULATION_TIMEOUT = 15000; // 15 seconds for simulation once awake

  // Wake up backend on app load
  useEffect(() => {
    const wakeUpBackend = async () => {
      setBackendWaking(true);
      console.log('Attempting to wake backend...');

      const wakePromise = fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
      });

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), WAKE_TIMEOUT)
      );

      try {
        const result = await Promise.race([wakePromise, timeoutPromise]);

        if (result.timeout) {
          console.log('⚠️ Backend wake timeout - will use demo data');
          setBackendReady(false);
          setBackendWaking(false);
        } else if (result.ok) {
          console.log('✅ Backend is ready!');
          setBackendReady(true);
          setBackendWaking(false);
        } else {
          throw new Error('Backend not responding');
        }
      } catch (error) {
        console.log('⚠️ Backend unavailable - demo mode active');
        setBackendReady(false);
        setBackendWaking(false);
      }
    };

    wakeUpBackend();
  }, [BACKEND_URL, WAKE_TIMEOUT]);

  useEffect(() => {
    if (!backendReady) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/generate_hackathon_dashboard_data`);
        if (!response.ok) return;
        const data = await response.json();
        setPlatformData(data);
      } catch (error) {
        console.log('⚠️ Dashboard data unavailable');
      }
    };

    fetchDashboardData();
  }, [backendReady, BACKEND_URL]);

  const handleSimulation = async (moleculeType, method, context, options = {}) => {
    setLoading(true);
    setPesticideDesign(null);
    setNutrientDesign(null);
    setMaterialDesign(null);
    setDockingResults(null);

    // If backend isn't ready, immediately use dummy data
    if (!backendReady) {
      console.log('Backend not ready - using demo data');
      setTimeout(() => {
        setSimulationResults(getDummyData(moleculeType));
        setLoading(false);
      }, 1500); // Simulate some processing time
      return;
    }

    // Backend is ready, try simulation with shorter timeout
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('⏱️ Simulation timeout - using demo data');
        resolve({ timeout: true });
      }, SIMULATION_TIMEOUT);
    });

    const fetchPromise = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/simulate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            molecule_string: getMoleculeString(moleculeType),
            method: method || 'vqe'
          })
        });

        if (!response.ok) {
          console.log('⚠️ Backend returned error');
          return { error: true };
        }

        const results = await response.json();
        console.log('✅ Simulation complete!');
        return results;
      } catch (error) {
        console.log('❌ Simulation failed:', error.message);
        return { error: true };
      }
    };

    if (context === 'pesticide') {
      const pesticidePayload = {
        target_pest: options.targetPest || 'fall_armyworm',
        crop_type: options.cropType || 'maize',
        environmental_safety_level: options.safetyLevel || 'high',
        biodegradability_required: true,
        location: {
          latitude: -1.95,
          longitude: 30.06,
          district: options.district || 'Kigali',
        },
      };

      fetch(`${BACKEND_URL}/design_molecular_pesticide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pesticidePayload),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data) setPesticideDesign(data);
        })
        .catch(() => { });

      const dockingPayload = {
        compound_string: getMoleculeString(moleculeType),
        target_site: 'pest_receptor',
        analysis_type: 'binding_affinity',
      };

      fetch(`${BACKEND_URL}/molecular_docking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dockingPayload),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data) setDockingResults(data);
        })
        .catch(() => { });
    } else if (context === 'nutrient') {
      const nutrientPayload = {
        target_crop: options.cropType || 'beans',
        deficient_nutrients: ['iron', 'zinc'],
        enhancement_method: 'foliar_spray',
        target_increase_percent: 50,
      };

      fetch(`${BACKEND_URL}/design_nutrient_enhancement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nutrientPayload),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data) setNutrientDesign(data);
        })
        .catch(() => { });
    } else if (context === 'material') {
      const materialPayload = {
        application: 'mulch_film',
        source_materials: ['cassava_starch', 'banana_fiber'],
        required_properties: ['biodegradable', 'UV_resistant', 'water_resistant'],
        performance_duration_months: 6,
      };

      fetch(`${BACKEND_URL}/design_sustainable_material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialPayload),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data) setMaterialDesign(data);
        })
        .catch(() => { });
    }

    const result = await Promise.race([fetchPromise(), timeoutPromise]);

    if (result.timeout || result.error || !result.success) {
      console.log('Using demo data');
      setSimulationResults(getDummyData(moleculeType));
    } else {
      setSimulationResults(result);
    }

    setLoading(false);
  };

  const getDummyData = (moleculeType) => {
    const dummyDataMap = {
      water: {
        success: true,
        classical_energy: -76.3,
        quantum_energy: -76.28,
        dipole_moment: [0.0, 0.0, 1.85],
        computation_time_ms: 150,
        method_used: 'vqe',
        agricultural_activity: {
          pesticide_activity_score: 0.3,
          bioavailability_prediction: 'high'
        },
        atom_data: [
          { symbol: 'O', x: 0, y: 0, z: 0 },
          { symbol: 'H', x: 0.76, y: 0.59, z: 0 },
          { symbol: 'H', x: -0.76, y: 0.59, z: 0 }
        ]
      },
      pesticide: {
        success: true,
        classical_energy: -245.7,
        quantum_energy: -245.65,
        dipole_moment: [1.2, 0.8, 2.3],
        computation_time_ms: 180,
        method_used: 'vqe',
        agricultural_activity: {
          pesticide_activity_score: 0.85,
          bioavailability_prediction: 'high'
        },
        atom_data: [
          { symbol: 'C', x: 0, y: 0, z: 0 },
          { symbol: 'C', x: 1.4, y: 0, z: 0 },
          { symbol: 'N', x: 2.8, y: 0, z: 0 },
          { symbol: 'O', x: 1.4, y: 1.4, z: 0 },
          { symbol: 'Cl', x: 0, y: -1.4, z: 0 },
          { symbol: 'H', x: 2.8, y: 1.4, z: 0 }
        ]
      },
      nutrient: {
        success: true,
        classical_energy: -1847.2,
        quantum_energy: -1847.15,
        dipole_moment: [0.5, 1.1, 1.9],
        computation_time_ms: 195,
        method_used: 'vqe',
        agricultural_activity: {
          pesticide_activity_score: 0.72,
          bioavailability_prediction: 'high'
        },
        atom_data: [
          { symbol: 'C', x: 0, y: 0, z: 0 },
          { symbol: 'N', x: 1.4, y: 0, z: 0 },
          { symbol: 'N', x: 2.8, y: 0, z: 0 },
          { symbol: 'O', x: 1.4, y: 1.4, z: 0 },
          { symbol: 'Fe', x: 4.2, y: 0.7, z: 0 }
        ]
      }
    };

    return dummyDataMap[moleculeType] || dummyDataMap.water;
  };

  const getMoleculeString = (type) => {
    const molecules = {
      water: "O 0 0 0; H 0.76 0 0; H -0.76 0 0",
      pesticide: "C 0 0 0; C 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Cl 0 -1.4 0; H 2.8 1.4 0",
      nutrient: "C 0 0 0; N 1.4 0 0; N 2.8 0 0; O 1.4 1.4 0; Fe 4.2 0.7 0"
    };
    return molecules[type] || molecules.water;
  };

  // Handle molecule selection and auto-run simulation
  const handleMoleculeSelect = (moleculeType) => {
    console.log('Selected molecule:', moleculeType);
    setSelectedMolecule(moleculeType);

    // CRITICAL: Clear all previous simulation results when switching molecules
    setSimulationResults(null);
    setPesticideDesign(null);
    setNutrientDesign(null);
    setMaterialDesign(null);
    setDockingResults(null);

    setActiveTab('simulation');

    // Auto-run simulation for the selected molecule
    setTimeout(() => {
      handleSimulation(moleculeType, 'vqe', 'pesticide', {
        targetPest: 'fall_armyworm',
        cropType: 'maize'
      });
    }, 500);
  };

  return (
    <ChatbotProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>🇷🇼 Rwanda Quantum Agricultural Intelligence</h1>
            <p>NISR 2025 Big Data Hackathon - Molecular Simulation Platform</p>
          </div>

          {/* Backend status indicator */}
          <div className="backend-status">
            {backendWaking ? (
              <span className="status-initializing">⚛️ Waking Quantum Systems...</span>
            ) : backendReady ? (
              <span className="status-active">⚛️ Quantum Backend: Active</span>
            ) : (
              <span className="status-initializing">⚛️ Demo Mode: Active</span>
            )}
          </div>
        </header>

        <main className="app-main">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulation')}
            >
              Quantum Simulation
            </button>
            <button
              className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              Molecular Database
            </button>
            <button
              className={`tab-btn ${activeTab === 'designer' ? 'active' : ''}`}
              onClick={() => setActiveTab('designer')}
            >
              Sub-Atomic Designer
            </button>
            <button
              className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced Simulations
            </button>
            <button
              className={`tab-btn ${activeTab === 'rwanda' ? 'active' : ''}`}
              onClick={() => setActiveTab('rwanda')}
            >
              🇷🇼 Rwanda Agricultural Intelligence
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={18} style={{ display: 'inline', marginRight: '6px' }} /> Analytics Dashboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              🔗 Payment
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'simulation' && (
              <ControlPanel
                selectedMolecule={selectedMolecule}
                onMoleculeSelect={handleMoleculeSelect}
                onRunSimulation={handleSimulation}
                loading={loading}
                simulationResults={simulationResults}
                pesticideDesign={pesticideDesign}
                nutrientDesign={nutrientDesign}
                materialDesign={materialDesign}
                dockingResults={dockingResults}
                platformData={platformData}
              />
            )}

            {activeTab === 'database' && (
              <EnhancedMolecularDatabase
                onMoleculeSelect={setSelectedDatabaseMolecule}
                selectedMoleculeId={selectedDatabaseMolecule?.id}
              />
            )}

            {activeTab === 'designer' && (
              <SubAtomicDesigner
                selectedMolecule={selectedDatabaseMolecule}
                onDesignComplete={setSubAtomicDesignResult}
              />
            )}

            {activeTab === 'advanced' && (
              <AdvancedSimulations
                ref={advancedSimulationsRef}
                backendUrl={BACKEND_URL}
                selectedMolecule={selectedMolecule}
              />
            )}

            {activeTab === 'rwanda' && (
              <RwandaAgricultural
                backendUrl={BACKEND_URL}
                backendReady={backendReady}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics
                backendUrl={BACKEND_URL}
                backendReady={backendReady}
              />
            )}

            {activeTab === 'payment' && (
              <PaymentTab />
            )}
          </div>
        </main>

        <footer className="app-footer">
          <p>Quantum-Enhanced Agriculture for Rwanda's Future | NISR 2025</p>
        </footer>

        {/* AI Assistant Chatbot */}
        <AIAssistant
          backendUrl={BACKEND_URL}
          selectedMolecule={selectedMolecule}
          currentTab={activeTab}
          selectedRegion={null}
          selectedCrop={null}
          onTabChange={setActiveTab}
          onMoleculeSelect={setSelectedMolecule}
          onDatabaseMoleculeSelect={setSelectedDatabaseMolecule}
          onSimulationRun={(params) => {
            // When chatbot triggers simulation, run it
            console.log('onSimulationRun called with params:', params);
            if (advancedSimulationsRef.current) {
              console.log('🎬 Calling runSimulation on ref...');
              advancedSimulationsRef.current.runSimulation();
            } else {
              console.log('❌ advancedSimulationsRef.current is null!');
            }
          }}
        />

        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </ChatbotProvider>
  );
}

export default App;