// Action Registry - Modular system for registering chatbot actions
// This allows easy addition of new commands without modifying core chatbot code

class ActionRegistry {
    constructor() {
        this.actions = new Map();
        this.aliases = new Map();
        this.registerDefaultActions();
    }

    // Register a new action
    register(actionId, config) {
        const {
            handler,
            description,
            aliases = [],
            requiresParams = [],
            options = null,
            category = 'general'
        } = config;

        this.actions.set(actionId, {
            id: actionId,
            handler,
            description,
            requiresParams,
            options,
            category
        });

        // Register aliases
        aliases.forEach(alias => {
            this.aliases.set(alias.toLowerCase(), actionId);
        });

        console.log(`✅ Registered action: ${actionId}`);
    }

    // Get action by ID or alias
    getAction(identifier) {
        const normalizedId = identifier.toLowerCase();

        // Check if it's an alias first
        if (this.aliases.has(normalizedId)) {
            const actionId = this.aliases.get(normalizedId);
            return this.actions.get(actionId);
        }

        // Check if it's a direct action ID
        return this.actions.get(normalizedId);
    }

    // Get all actions in a category
    getActionsByCategory(category) {
        return Array.from(this.actions.values())
            .filter(action => action.category === category);
    }

    // Get all available actions
    getAllActions() {
        return Array.from(this.actions.values());
    }

    // Check if action exists
    hasAction(identifier) {
        return this.getAction(identifier) !== undefined;
    }

    // Execute an action
    async execute(actionId, context, params = {}) {
        const action = this.getAction(actionId);

        if (!action) {
            throw new Error(`Action not found: ${actionId}`);
        }

        // Validate required parameters
        const missingParams = action.requiresParams.filter(param => !(param in params));
        if (missingParams.length > 0) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }

        // Execute the action handler
        try {
            const result = await action.handler(context, params);
            return { success: true, result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Register default actions
    registerDefaultActions() {
        // Tab Navigation Actions
        this.register('switch_to_simulation', {
            handler: (context) => context.executeStateChange({
                type: 'SET_ACTIVE_TAB',
                payload: { tab: 'simulation' },
                metadata: { source: 'chatbot' }
            }),
            description: 'Switch to Quantum Simulation tab',
            aliases: ['go to simulation', 'open simulation', 'show simulation'],
            category: 'navigation'
        });

        this.register('switch_to_database', {
            handler: (context) => context.executeStateChange({
                type: 'SET_ACTIVE_TAB',
                payload: { tab: 'database' },
                metadata: { source: 'chatbot' }
            }),
            description: 'Switch to Molecular Database tab',
            aliases: ['go to database', 'open database', 'show molecules'],
            category: 'navigation'
        });

        this.register('switch_to_designer', {
            handler: (context) => context.executeStateChange({
                type: 'SET_ACTIVE_TAB',
                payload: { tab: 'designer' },
                metadata: { source: 'chatbot' }
            }),
            description: 'Switch to Sub-Atomic Designer tab',
            aliases: ['go to designer', 'open designer', 'design molecule'],
            category: 'navigation'
        });

        this.register('switch_to_advanced', {
            handler: (context) => context.executeStateChange({
                type: 'SET_ACTIVE_TAB',
                payload: { tab: 'advanced' },
                metadata: { source: 'chatbot' }
            }),
            description: 'Switch to Advanced Simulations tab',
            aliases: ['go to advanced', 'open advanced', 'advanced simulations'],
            category: 'navigation'
        });

        this.register('switch_to_rwanda', {
            handler: (context) => context.executeStateChange({
                type: 'SET_ACTIVE_TAB',
                payload: { tab: 'rwanda' },
                metadata: { source: 'chatbot' }
            }),
            description: 'Switch to Rwanda Agricultural Intelligence tab',
            aliases: ['go to rwanda', 'open rwanda', 'show rwanda', 'rwanda agriculture'],
            category: 'navigation'
        });

        this.register('switch_to_analytics', {
            handler: (context) => context.executeStateChange({
                type: 'SET_ACTIVE_TAB',
                payload: { tab: 'analytics' },
                metadata: { source: 'chatbot' }
            }),
            description: 'Switch to Analytics Dashboard tab',
            aliases: ['go to analytics', 'open analytics', 'show analytics', 'dashboard'],
            category: 'navigation'
        });

        // Molecule Selection Actions
        this.register('select_molecule', {
            handler: (context, params) => context.executeStateChange({
                type: 'SET_SELECTED_MOLECULE',
                payload: { molecule: params.molecule },
                metadata: { source: 'chatbot' }
            }),
            description: 'Select a molecule for simulation',
            requiresParams: ['molecule'],
            options: ['water', 'pesticide', 'nutrient'],
            category: 'selection'
        });

        // District Selection Actions
        this.register('select_district', {
            handler: (context, params) => context.executeStateChange({
                type: 'SET_SELECTED_DISTRICT',
                payload: { district: params.district },
                metadata: { source: 'chatbot' }
            }),
            description: 'Select a district on the map',
            requiresParams: ['district'],
            category: 'selection'
        });

        // Map Layer Actions
        this.register('set_map_layer', {
            handler: (context, params) => context.executeStateChange({
                type: 'SET_MAP_LAYER',
                payload: { layer: params.layer },
                metadata: { source: 'chatbot' }
            }),
            description: 'Change map layer',
            requiresParams: ['layer'],
            options: ['satellite', 'street', 'terrain', 'hybrid'],
            aliases: ['change layer', 'switch layer', 'map layer'],
            category: 'map'
        });

        // Simulation Actions
        this.register('run_simulation', {
            handler: (context, params) => {
                // Composite action: switch tab + trigger simulation
                return context.executeStateChange({
                    type: 'COMPOSITE_ACTION',
                    payload: {
                        actions: [
                            {
                                type: 'SET_ACTIVE_TAB',
                                payload: { tab: 'simulation' }
                            },
                            {
                                type: 'TRIGGER_SIMULATION',
                                payload: { params }
                            }
                        ]
                    },
                    metadata: { source: 'chatbot' }
                });
            },
            description: 'Run quantum simulation',
            aliases: ['simulate', 'start simulation', 'run sim'],
            category: 'simulation'
        });

        // Smart District Selection - Composite Action
        // When user types a district name, automatically:
        // 1. Navigate to Rwanda Agricultural Intelligence tab
        // 2. Select Soil Analysis subtab
        // 3. Select the district on the map
        this.register('smart_district_selection', {
            handler: (context, params) => {
                return context.executeStateChange({
                    type: 'COMPOSITE_ACTION',
                    payload: {
                        actions: [
                            {
                                type: 'SET_ACTIVE_TAB',
                                payload: { tab: 'rwanda' }
                            },
                            {
                                type: 'SET_RWANDA_SECTION',
                                payload: { section: 'soil' }
                            },
                            {
                                type: 'SET_SELECTED_DISTRICT',
                                payload: { district: params.district }
                            }
                        ]
                    },
                    metadata: { source: 'chatbot', action: 'smart_district_selection' }
                });
            },
            description: 'Smart district selection: Navigate to Rwanda tab, select soil analysis, and select district',
            requiresParams: ['district'],
            category: 'smart_actions'
        });

        console.log('✅ Default actions registered');
    }
}

// Export singleton instance
const actionRegistry = new ActionRegistry();
export default actionRegistry;
