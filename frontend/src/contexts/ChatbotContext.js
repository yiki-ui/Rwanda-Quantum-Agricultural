import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Context for Chatbot State Management
const ChatbotContext = createContext(null);

// Custom hook to use chatbot context
export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error('useChatbot must be used within ChatbotProvider');
    }
    return context;
};

// Chatbot Provider Component
export const ChatbotProvider = ({ children }) => {
    // Controllable UI State
    const [activeTab, setActiveTab] = useState('simulation');
    const [selectedMolecule, setSelectedMolecule] = useState('water');
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedDatabaseMolecule, setSelectedDatabaseMolecule] = useState(null);
    const [mapLayer, setMapLayer] = useState('satellite');
    const [simulationTrigger, setSimulationTrigger] = useState(0);
    const [rwandaSection, setRwandaSection] = useState('overview'); // For Rwanda Agricultural Intelligence subtabs

    // Action execution state
    const [pendingAction, setPendingAction] = useState(null);
    const [actionHistory, setActionHistory] = useState([]);

    // Execute state change from chatbot command
    const executeStateChange = useCallback((stateUpdate) => {
        console.log('🎯 Executing state change:', stateUpdate);

        const { type, payload, metadata } = stateUpdate;

        try {
            switch (type) {
                case 'SET_ACTIVE_TAB':
                    setActiveTab(payload.tab);
                    break;

                case 'SET_SELECTED_MOLECULE':
                    setSelectedMolecule(payload.molecule);
                    break;

                case 'SET_SELECTED_DISTRICT':
                    setSelectedDistrict(payload.district);
                    break;

                case 'SET_DATABASE_MOLECULE':
                    setSelectedDatabaseMolecule(payload.molecule);
                    break;

                case 'SET_MAP_LAYER':
                    setMapLayer(payload.layer);
                    break;

                case 'SET_RWANDA_SECTION':
                    // Set the active section in Rwanda Agricultural Intelligence tab
                    setRwandaSection(payload.section);
                    break;

                case 'TRIGGER_SIMULATION':
                    // Increment trigger to force re-run
                    setSimulationTrigger(prev => prev + 1);
                    break;

                case 'COMPOSITE_ACTION':
                    // Execute multiple state changes in sequence
                    payload.actions.forEach((action, index) => {
                        setTimeout(() => {
                            executeStateChange(action);
                        }, index * 100); // Stagger by 100ms
                    });
                    break;

                default:
                    console.warn('Unknown state change type:', type);
                    return { success: false, error: 'Unknown action type' };
            }

            // Record action in history
            setActionHistory(prev => [...prev, {
                timestamp: new Date(),
                type,
                payload,
                metadata,
                success: true
            }]);

            return { success: true };
        } catch (error) {
            console.error('State change error:', error);
            setActionHistory(prev => [...prev, {
                timestamp: new Date(),
                type,
                payload,
                error: error.message,
                success: false
            }]);

            return { success: false, error: error.message };
        }
    }, []);

    // Get current state snapshot
    const getStateSnapshot = useCallback(() => {
        return {
            activeTab,
            selectedMolecule,
            selectedDistrict,
            selectedDatabaseMolecule,
            mapLayer,
            simulationTrigger,
            rwandaSection
        };
    }, [activeTab, selectedMolecule, selectedDistrict, selectedDatabaseMolecule, mapLayer, simulationTrigger, rwandaSection]);

    const value = {
        // State
        activeTab,
        selectedMolecule,
        selectedDistrict,
        selectedDatabaseMolecule,
        mapLayer,
        simulationTrigger,
        rwandaSection,
        pendingAction,
        actionHistory,

        // Setters (for direct use by components)
        setActiveTab,
        setSelectedMolecule,
        setSelectedDistrict,
        setSelectedDatabaseMolecule,
        setMapLayer,
        setSimulationTrigger,
        setRwandaSection,
        setPendingAction,

        // Chatbot control functions
        executeStateChange,
        getStateSnapshot
    };

    return (
        <ChatbotContext.Provider value={value}>
            {children}
        </ChatbotContext.Provider>
    );
};

export default ChatbotContext;
