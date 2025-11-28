"""
AI Chatbot Agent for Rwanda Quantum Agriculture Intelligence Platform
Uses Groq API for intelligent conversational assistance
"""

import os
import json
from typing import Optional, Dict, List, Any
from datetime import datetime
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Groq API integration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Domain knowledge for Rwanda agriculture
AGRICULTURE_KNOWLEDGE = {
    "crops": {
        "coffee": {
            "pests": ["coffee berry borer", "leaf rust"],
            "nutrients": ["nitrogen", "potassium", "magnesium"],
            "regions": ["Huye", "Nyamagabe", "Nyaruguru"],
            "season": "year-round"
        },
        "banana": {
            "pests": ["weevils", "nematodes"],
            "nutrients": ["potassium", "nitrogen", "phosphorus"],
            "regions": ["Karongi", "Rutsiro", "Nyamasheke"],
            "season": "year-round"
        },
        "maize": {
            "pests": ["fall armyworm", "stem borers"],
            "nutrients": ["nitrogen", "phosphorus", "potassium"],
            "regions": ["Kayonza", "Kirehe", "Ngoma"],
            "season": "March-July, September-December"
        },
        "beans": {
            "pests": ["bruchids", "leaf beetles"],
            "nutrients": ["phosphorus", "potassium"],
            "regions": ["Huye", "Gisagara", "Nyaruguru"],
            "season": "March-May, September-November"
        }
    },
    "quantum_concepts": {
        "VQE": "Variational Quantum Eigensolver - finds lowest energy state of molecules",
        "QAOA": "Quantum Approximate Optimization Algorithm - solves optimization problems",
        "Hartree-Fock": "Computational chemistry method for molecular structure",
        "DFT": "Density Functional Theory - predicts molecular properties",
        "Bond Scanning": "Analyzes how molecular energy changes with bond distance",
        "Geometry Optimization": "Finds most stable molecular configuration"
    },
    "pesticides": {
        "fall_armyworm": {
            "target_crops": ["maize", "sorghum"],
            "regions": ["Kayonza", "Kirehe", "Ngoma"],
            "season": "March-July",
            "damage": "Leaf damage, stem boring"
        },
        "coffee_berry_borer": {
            "target_crops": ["coffee"],
            "regions": ["Huye", "Nyamagabe"],
            "season": "year-round",
            "damage": "Berry destruction, crop loss"
        }
    },
    "rwandan_districts": [
        "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
        "Bugesera", "Gisagara", "Huye", "Nyamagabe", "Nyaruguru", "Ruhango",
        "Karongi", "Karongi", "Nyamasheke", "Nyabihu", "Rutsiro", "Rubavu",
        "Musanze", "Gakenke", "Rulindo", "Burera", "Gicumbi", "Ruhengeri",
        "Kigali", "Gasabo", "Kicukiro", "Nyarugenge"
    ]
}

# Platform Tools for Groq Function Calling
# These are the structured tools the AI agent can use to control the UI
PLATFORM_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "run_quantum_simulation",
            "description": "Run quantum simulation in the Quantum Simulation tab (the tab with 3D molecules: water, pesticide, nutrient and a blue 'Run Simulation' button). This is the DEFAULT simulation tab.",
            "parameters": {
                "type": "object",
                "properties": {
                    "molecule": {
                        "type": "string",
                        "enum": ["water", "pesticide", "nutrient"],
                        "description": "Molecule to simulate (water, pesticide, or nutrient)"
                    }
                },
                "required": ["molecule"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_bond_scan",
            "description": "Run bond distance scanning in the Advanced Simulations tab. Analyzes how molecular energy changes with bond distance.",
            "parameters": {
                "type": "object",
                "properties": {
                    "atom1_index": {
                        "type": "integer",
                        "description": "Index of first atom (default: 0)"
                    },
                    "atom2_index": {
                        "type": "integer",
                        "description": "Index of second atom (default: 1)"
                    },
                    "start_distance": {
                        "type": "number",
                        "description": "Starting distance in Angstroms (default: 0.5)"
                    },
                    "end_distance": {
                        "type": "number",
                        "description": "Ending distance in Angstroms (default: 3.0)"
                    },
                    "steps": {
                        "type": "integer",
                        "description": "Number of steps (default: 20)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_geometry_optimization",
            "description": "Run geometry optimization in the Advanced Simulations tab. Finds the most stable molecular configuration.",
            "parameters": {
                "type": "object",
                "properties": {
                    "molecule": {
                        "type": "string",
                        "description": "Molecule to optimize"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "navigate_to_tab",
            "description": "Navigate to a specific tab in the platform",
            "parameters": {
                "type": "object",
                "properties": {
                    "tab": {
                        "type": "string",
                        "enum": ["simulation", "database", "designer", "advanced", "rwanda", "analytics"],
                        "description": "Tab to navigate to: 'simulation' (Quantum Simulation with 3D molecules), 'database' (Molecular Database), 'designer' (Sub-Atomic Designer), 'advanced' (Advanced Simulations), 'rwanda' (Rwanda Agricultural Intelligence), 'analytics' (Analytics Dashboard)"
                    }
                },
                "required": ["tab"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "select_molecule",
            "description": "Select a molecule for simulation in the Quantum Simulation tab",
            "parameters": {
                "type": "object",
                "properties": {
                    "molecule": {
                        "type": "string",
                        "enum": ["water", "pesticide", "nutrient"],
                        "description": "Molecule to select"
                    }
                },
                "required": ["molecule"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "browse_molecular_database",
            "description": "Open and browse the molecular database to view agricultural molecules",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": ["all", "pesticides", "nutrients", "materials"],
                        "description": "Category to filter (default: all)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "select_district",
            "description": "Select a district in Rwanda for agricultural analysis in the Rwanda Agricultural Intelligence tab",
            "parameters": {
                "type": "object",
                "properties": {
                    "district": {
                        "type": "string",
                        "description": "Name of the Rwandan district (e.g., Gatsibo, Kayonza, Huye, Kirehe)"
                    }
                },
                "required": ["district"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "open_molecule_designer",
            "description": "Open the Sub-Atomic Designer to create custom molecules for specific agricultural problems",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]

# Tool to Action mapping
TOOL_TO_ACTION_MAP = {
    "run_quantum_simulation": "trigger_run_simulation",
    "run_bond_scan": "bond_scan",
    "run_geometry_optimization": "geometry_opt",
    "navigate_to_tab": lambda args: f"switch_to_{args.get('tab', 'simulation')}",
    "select_molecule": "select_molecule",
    "browse_molecular_database": "switch_to_database",
    "select_district": "smart_district_selection",  # Use smart selection for districts
    "open_molecule_designer": "switch_to_designer"
}


# System prompt for the AI agent - FRIENDLY BUT FOCUSED
SYSTEM_PROMPT = """You are Rwanda Agriculture AI - a friendly, helpful assistant for the Rwanda Quantum Agriculture Intelligence Platform.

🎯 YOUR ROLE:
- Be conversational and friendly (respond to greetings, questions naturally)
- Help users navigate and use the platform
- Provide information about quantum agriculture
- Use tools when users want to DO something

CONVERSATION RULES:
1. **Casual chat**: Respond naturally to greetings ("hey", "hello", "how are you")
2. **Questions**: Answer questions about agriculture, quantum computing, Rwanda farming
3. **Commands**: When users ask to DO something → USE A TOOL
4. **Keep responses SHORT** (1-3 sentences unless explaining complex topics)

AVAILABLE TOOLS (use when user wants action):
- run_quantum_simulation: Run simulation in Quantum Simulation tab
- navigate_to_tab: Switch tabs (simulation, database, designer, advanced, rwanda, analytics)
- select_molecule: Select molecule (water, pesticide, nutrient)
- run_bond_scan: Bond distance scanning
- run_geometry_optimization: Geometry optimization
- browse_molecular_database: Open database
- select_district: Select Rwanda district
- open_molecule_designer: Open designer

EXAMPLES:
User: "hey how are you?"
You: "I'm doing great! Ready to help you with quantum agriculture. What would you like to explore?"

User: "what is VQE?"
You: "VQE (Variational Quantum Eigensolver) finds the lowest energy state of molecules. It's useful for designing better pesticides and nutrients for farming."

User: "run simulation"
You: [USE TOOL: run_quantum_simulation] "Running quantum simulation now!"

User: "show me rwanda data"
You: [USE TOOL: navigate_to_tab(rwanda)] "Opening Rwanda Agricultural Intelligence tab."

STAY FOCUSED: Keep conversations about Rwanda agriculture, quantum computing, farming, and the platform. Politely redirect if asked about unrelated topics."""


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Request for chat completion"""
    message: str
    conversation_history: Optional[List[ChatMessage]] = None
    context: Optional[Dict[str, Any]] = None  # UI context, selected molecule, etc.


class ChatResponse(BaseModel):
    """Response from chat completion"""
    message: str
    suggestions: Optional[List[str]] = None  # UI action suggestions
    action: Optional[str] = None  # Suggested action (e.g., "run_simulation")
    action_params: Optional[Dict[str, Any]] = None  # Parameters for suggested action
    timestamp: str


class AIAgent:
    """Main AI Agent for chatbot interactions"""

    # Keywords for platform-related content
    ALLOWED_KEYWORDS = {
        # Crops
        "coffee", "banana", "maize", "beans", "crop", "crops",
        # Pests
        "pest", "pests", "armyworm", "borer", "weevil", "nematode", "beetle",
        # Quantum
        "quantum", "vqe", "qaoa", "simulation", "molecule", "molecular", "bond", "geometry",
        "hartree", "fock", "dft", "optimization", "energy", "algorithm",
        # Agriculture
        "agriculture", "farm", "farming", "farmer", "nutrient", "nitrogen", "phosphorus",
        "potassium", "soil", "yield", "harvest", "season", "region", "district",
        # Rwanda
        "rwanda", "huye", "kayonza", "kirehe", "ngoma", "kigali", "district",
        # Platform
        "platform", "simulation", "design", "molecule", "tool", "feature",
        # General agriculture terms
        "pest control", "disease", "damage", "control", "treatment", "solution",
        "deficiency", "enhancement", "biofortification", "spray", "application"
    }

    # Keywords that indicate off-topic content
    BLOCKED_KEYWORDS = {
        "politics", "religion", "sports", "entertainment", "movie", "music", "game",
        "weather", "news", "stock", "bitcoin", "crypto", "dating", "love", "relationship",
        "medical", "doctor", "disease", "health", "covid", "vaccine", "legal", "law",
        "president", "government", "war", "conflict", "joke", "funny", "meme"
    }

    def __init__(self):
        self.groq_api_key = GROQ_API_KEY
        # Using latest available Groq model
        self.model = "llama-3.3-70b-versatile"
        self.agriculture_knowledge = AGRICULTURE_KNOWLEDGE

    def _is_platform_related(self, message: str) -> bool:
        """
        Check if message is related to the platform.
        Returns True if message is about Rwanda agriculture/quantum computing OR is casual conversation.
        Returns False if message is clearly off-topic.
        """
        message_lower = message.lower()
        
        # ALLOW common greetings and casual conversation
        greeting_phrases = [
            "hi", "hello", "hey", "how are you", "what's up", "whats up",
            "good morning", "good afternoon", "good evening",
            "thanks", "thank you", "ok", "okay", "yes", "no",
            "help", "what can you do", "who are you", "what are you"
        ]
        
        # Check for greetings first (always allow)
        for greeting in greeting_phrases:
            if greeting in message_lower:
                return True
        
        # Check for blocked keywords (truly off-topic)
        for blocked in self.BLOCKED_KEYWORDS:
            if blocked in message_lower:
                return False
        
        # Check for allowed keywords (platform-related)
        for allowed in self.ALLOWED_KEYWORDS:
            if allowed in message_lower:
                return True
        
        # For very short messages (1-3 words), allow them (likely greetings or questions)
        word_count = len(message.split())
        if word_count <= 3:
            return True
        
        # Default to allowing if unclear (let Groq handle it with system prompt)
        return True

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Process user message and generate response
        """
        if not self.groq_api_key:
            return ChatResponse(
                message="⚠️ AI Agent not configured. Please set GROQ_API_KEY environment variable.",
                timestamp=datetime.now().isoformat()
            )

        # STRICT CONTENT FILTER: Check if message is platform-related
        if not self._is_platform_related(request.message):
            return ChatResponse(
                message="🚫 I'm designed specifically for Rwanda Quantum Agriculture. I can only help with quantum agriculture questions. Please ask about crops, pests, simulations, or quantum computing for farming.",
                suggestions=["Ask about fall armyworm", "Ask about coffee pests", "Ask about simulations"],
                timestamp=datetime.now().isoformat()
            )

        try:
            # Build conversation history
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]

            # Add previous messages
            if request.conversation_history:
                for msg in request.conversation_history:
                    messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })

            # Add context information
            context_str = self._build_context_string(request.context)
            if context_str:
                messages.append({
                    "role": "system",
                    "content": f"Current platform context:\n{context_str}"
                })

            # Add current user message
            messages.append({
                "role": "user",
                "content": request.message
            })

            # Call Groq API
            response = await self._call_groq_api(messages)

            # Parse response and extract suggestions
            message_text = response.get("content", "")
            tool_call = response.get("tool_call")  # Check for tool call
            
            # Extract action from tool call or message text
            action, action_params = self._extract_action(message_text, request.context, tool_call)
            suggestions = self._extract_suggestions(message_text, request.context)

            return ChatResponse(
                message=message_text,
                suggestions=suggestions,
                action=action,
                action_params=action_params,
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            return ChatResponse(
                message=f"Error: {str(e)}",
                timestamp=datetime.now().isoformat()
            )

    async def _call_groq_api(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Call Groq API for chat completion with function calling support"""
        # Validate API key
        if not self.groq_api_key or not self.groq_api_key.strip():
            raise ValueError("GROQ_API_KEY is not set or is empty")
        
        # Clean up API key (remove any whitespace)
        api_key = self.groq_api_key.strip()
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Validate and clean messages
        if not messages:
            raise ValueError("Messages list cannot be empty")
        
        # Ensure all messages have required fields
        for msg in messages:
            if "role" not in msg or "content" not in msg:
                raise ValueError(f"Invalid message format: {msg}")
            if not isinstance(msg["content"], str):
                msg["content"] = str(msg["content"])

        # Build payload with function calling support
        # Detect if user is asking for an action (should use tools)
        user_message = messages[-1]["content"].lower() if messages else ""
        action_keywords = [
            "run", "simulation", "simulate", "execute", "start", "trigger",
            "open", "show", "navigate", "go to", "switch", "view",
            "select", "choose", "pick",
            "browse", "database", "designer", "bond scan", "geometry",
            "district", "rwanda", "gasabo", "gatsibo", "kayonza", "kirehe",
            "analytics", "molecule", "water", "pesticide", "nutrient",
            "optimization", "scan", "bond"
        ]
        is_action_request = any(keyword in user_message for keyword in action_keywords)
        
        payload = {
            "model": "llama-3.3-70b-versatile",  # Latest Groq model
            "messages": messages,
            "tools": PLATFORM_TOOLS,  # Add platform tools
            "tool_choice": "auto",  # Let model decide when to use tools (required causes format errors)
            "temperature": 0.7,
            "max_tokens": 1024,
            "top_p": 1.0
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(GROQ_API_URL, json=payload, headers=headers)
                
                # If 400 error, log the payload for debugging
                if response.status_code == 400:
                    error_text = response.text
                    print(f"Groq API 400 Error: {error_text}")
                    print(f"Payload: {json.dumps(payload, indent=2)}")
                    raise ValueError(f"Groq API returned 400: {error_text}")
                
                response.raise_for_status()
                data = response.json()

                if "choices" not in data or len(data["choices"]) == 0:
                    raise ValueError(f"Invalid response format: {data}")

                message = data["choices"][0]["message"]
                
                # Check if Groq wants to call a tool
                if message.get("tool_calls"):
                    tool_call = message["tool_calls"][0]  # Get first tool call
                    function_name = tool_call["function"]["name"]
                    
                    # Parse arguments (they come as JSON string)
                    try:
                        arguments = json.loads(tool_call["function"]["arguments"])
                    except json.JSONDecodeError:
                        arguments = {}
                    
                    print(f"🔧 Tool Call: {function_name} with args: {arguments}")
                    
                    # Generate friendly message if Groq didn't provide one
                    friendly_message = message.get("content") or f"I'll {function_name.replace('_', ' ')} for you now."
                    
                    return {
                        "content": friendly_message,
                        "tool_call": {
                            "name": function_name,
                            "arguments": arguments
                        }
                    }
                
                # No tool call, return regular message
                content = message.get("content", "")
                if not content:
                    # Fallback if no content provided
                    content = "I'm here to help with quantum agriculture. What would you like to know?"
                
                return {
                    "content": content
                }
                
        except httpx.HTTPError as e:
            print(f"HTTP Error: {e}")
            raise
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            raise

    def _build_context_string(self, context: Optional[Dict[str, Any]]) -> str:
        """Build context string from UI state"""
        if not context:
            return ""

        parts = []

        if context.get("selected_molecule"):
            parts.append(f"Selected molecule: {context['selected_molecule']}")

        if context.get("current_tab"):
            parts.append(f"Current tab: {context['current_tab']}")

        if context.get("selected_region"):
            parts.append(f"Selected region: {context['selected_region']}")

        if context.get("selected_crop"):
            parts.append(f"Selected crop: {context['selected_crop']}")

        if context.get("simulation_results"):
            parts.append(f"Latest simulation results available")

        return "\n".join(parts)

    def _extract_suggestions(self, message: str, context: Optional[Dict[str, Any]]) -> List[str]:
        """Extract UI action suggestions from response"""
        suggestions = []

        # Check for simulation-related keywords
        if any(word in message.lower() for word in ["run", "simulate", "test", "analyze"]):
            suggestions.append("Run Simulation")

        # Check for database-related keywords
        if any(word in message.lower() for word in ["browse", "database", "molecules", "view"]):
            suggestions.append("Browse Database")

        # Check for design-related keywords
        if any(word in message.lower() for word in ["design", "create", "custom", "build"]):
            suggestions.append("Design Molecule")

        # Check for analytics-related keywords
        if any(word in message.lower() for word in ["analytics", "data", "statistics", "impact"]):
            suggestions.append("View Analytics")

        return suggestions[:3]  # Limit to 3 suggestions

    def _extract_action(self, message: str, context: Optional[Dict[str, Any]], tool_call: Optional[Dict[str, Any]] = None) -> tuple:
        """Extract suggested action and parameters from response or tool call"""
        
        # PRIORITY 1: If Groq made a tool call, use it directly (most reliable)
        if tool_call:
            function_name = tool_call.get("name")
            arguments = tool_call.get("arguments", {})
            
            print(f"🎯 Converting tool call '{function_name}' to action")
            
            # Map tool to action using TOOL_TO_ACTION_MAP
            action_mapper = TOOL_TO_ACTION_MAP.get(function_name)
            
            if action_mapper:
                # If mapper is a function, call it with arguments
                if callable(action_mapper):
                    action = action_mapper(arguments)
                else:
                    action = action_mapper
                
                print(f"✅ Mapped to action: {action} with params: {arguments}")
                return action, arguments
            else:
                print(f"⚠️ Unknown tool: {function_name}")
                return None, None
        
        # PRIORITY 2: Check if message is just a district name (smart district selection)
        message_clean = message.strip().upper()
        
        # List of all Rwandan districts
        all_districts = []
        for province_districts in self.agriculture_knowledge["rwandan_districts"]:
            if isinstance(province_districts, str):
                all_districts.append(province_districts.upper())
        
        # Also add the structured district list
        rwanda_districts_structured = [
            "BURERA", "GAKENKE", "GICUMBI", "MUSANZE", "RULINDO",  # Northern
            "GISAGARA", "HUYE", "KAMONYI", "MUHANGA", "NYAMAGABE", "NYANZA", "RUHANGO", "NYARUGURU",  # Southern
            "BUGESERA", "GATSIBO", "KAYONZA", "KIREHE", "NGOMA", "NYAGATARE", "RWAMAGANA",  # Eastern
            "KARONGI", "NGORORERO", "NYABIHU", "NYAMASHEKE", "RUBAVU", "RUSIZI", "RUTSIRO",  # Western
            "GASABO", "KICUKIRO", "NYARUGENGE"  # Kigali
        ]
        
        # Check if the message is a district name
        for district in rwanda_districts_structured:
            if district in message_clean or message_clean in district:
                print(f"🗺️ Detected district name: {district}")
                return "smart_district_selection", {"district": district.title()}
        
        # PRIORITY 3: Fallback to text-based extraction (less reliable)
        message_lower = message.lower()

        # Only extract actions if user explicitly asks for them
        # This prevents accidental navigation from casual conversation
        
        # Simulation-specific actions (highest priority - most specific)
        if "bond" in message_lower and "scan" in message_lower:
            return "bond_scan", {
                "molecule": context.get("selected_molecule", "H2O") if context else "H2O"
            }

        if "geometry" in message_lower and ("optimize" in message_lower or "optimization" in message_lower):
            return "geometry_opt", {
                "molecule": context.get("selected_molecule", "H2O") if context else "H2O"
            }

        # Pesticide design action
        if "pesticide" in message_lower and "design" in message_lower:
            return "design_pesticide", {
                "region": context.get("selected_region") if context else None,
                "crop": context.get("selected_crop") if context else None
            }

        # Run simulation action (trigger ControlPanel button)
        if any(phrase in message_lower for phrase in ["run simulation", "run the simulation", "start simulation", "execute simulation"]):
            return "trigger_run_simulation", {
                "molecule": context.get("selected_molecule", "H2O") if context else "H2O",
                "wait_for_completion": True
            }

        # Tab navigation actions (only on explicit request)
        # Check for explicit "show me" or "take me to" patterns
        if any(phrase in message_lower for phrase in ["show me the database", "browse database", "view molecules", "molecular database"]):
            return "switch_to_database", {}

        if any(phrase in message_lower for phrase in ["show me the designer", "go to designer", "design molecule", "create molecule"]):
            return "switch_to_designer", {}

        if any(phrase in message_lower for phrase in ["show me simulations", "go to simulations", "quantum simulation"]):
            return "switch_to_simulations", {}

        if any(phrase in message_lower for phrase in ["show me rwanda", "rwanda agricultural", "agricultural data"]):
            return "switch_to_rwanda", {}

        if any(phrase in message_lower for phrase in ["show me analytics", "view analytics", "analytics dashboard"]):
            return "switch_to_analytics", {}

        return None, None

    def get_agriculture_info(self, query: str) -> Optional[Dict[str, Any]]:
        """Get agricultural information from knowledge base"""
        query_lower = query.lower()

        # Search crops
        for crop, info in self.agriculture_knowledge["crops"].items():
            if crop in query_lower:
                return {"type": "crop", "data": info}

        # Search pests
        for pest, info in self.agriculture_knowledge["pesticides"].items():
            if pest.replace("_", " ") in query_lower:
                return {"type": "pest", "data": info}

        # Search quantum concepts
        for concept, explanation in self.agriculture_knowledge["quantum_concepts"].items():
            if concept.lower() in query_lower:
                return {"type": "concept", "data": {"name": concept, "explanation": explanation}}

        return None


# Utility functions for FastAPI integration
async def process_chat_message(message: str, history: Optional[List[ChatMessage]] = None,
                               context: Optional[Dict[str, Any]] = None) -> ChatResponse:
    """Process a chat message and return response"""
    agent = AIAgent()
    request = ChatRequest(
        message=message,
        conversation_history=history,
        context=context
    )
    return await agent.chat(request)


def get_agent_info() -> Dict[str, Any]:
    """Get information about the AI agent"""
    return {
        "name": "Rwanda Agriculture AI Assistant",
        "version": "1.0.0",
        "capabilities": [
            "Conversational assistance",
            "Quantum agriculture education",
            "Regional recommendations",
            "Simulation guidance",
            "Molecule design assistance"
        ],
        "supported_languages": ["English", "French", "Kinyarwanda"],
        "knowledge_base": {
            "crops": list(AGRICULTURE_KNOWLEDGE["crops"].keys()),
            "pests": list(AGRICULTURE_KNOWLEDGE["pesticides"].keys()),
            "concepts": list(AGRICULTURE_KNOWLEDGE["quantum_concepts"].keys()),
            "districts": len(AGRICULTURE_KNOWLEDGE["rwandan_districts"])
        }
    }
