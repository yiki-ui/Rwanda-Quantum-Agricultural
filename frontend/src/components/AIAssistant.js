import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2, Maximize2, Loader, Zap, HelpCircle, User, Lightbulb } from 'lucide-react';
import './AIAssistant.css';

const AIAssistant = ({
  backendUrl,
  selectedMolecule,
  currentTab,
  selectedRegion,
  selectedCrop,
  onTabChange,
  onMoleculeSelect,
  onDatabaseMoleculeSelect,
  onSimulationRun
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your Rwanda Agriculture AI Assistant. I can help you understand quantum computing for farming, explain simulations, suggest molecules for your crops, and answer any agricultural questions. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [agentInfo, setAgentInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch agent info on mount
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const response = await fetch(`${backendUrl}/ai/info`);
        if (response.ok) {
          const data = await response.json();
          setAgentInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch agent info:', error);
      }
    };

    if (backendUrl) {
      fetchAgentInfo();
    }
  }, [backendUrl]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const buildContext = () => {
    return {
      selected_molecule: selectedMolecule?.name || selectedMolecule || null,
      current_tab: currentTab,
      selected_region: selectedRegion,
      selected_crop: selectedCrop
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setSuggestions([]);

    try {
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to backend
      const response = await fetch(`${backendUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversation_history: conversationHistory,
          context: buildContext()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        action: data.action,
        action_params: data.action_params
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSuggestions(data.suggestions || []);

      // Execute chatbot action if present
      if (data.action) {
        handleChatbotAction(data.action, data.action_params);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please make sure the backend is running.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  // Handle chatbot actions for UI navigation
  const handleChatbotAction = (action, params) => {
    if (!action) return;

    console.log('Chatbot Action:', action, params);

    switch (action) {
      // Tab navigation
      case 'switch_to_database':
        onTabChange?.('database');
        break;
      case 'switch_to_designer':
        onTabChange?.('designer');
        break;
      case 'switch_to_simulations':
        onTabChange?.('advanced');
        // Small delay to let component render before running simulation
        setTimeout(() => {
          onSimulationRun?.(params);
        }, 500);
        break;
      case 'switch_to_rwanda':
        onTabChange?.('rwanda');
        break;
      case 'switch_to_analytics':
        onTabChange?.('analytics');
        break;
      case 'switch_to_simulation':
        onTabChange?.('simulation');
        break;

      // Molecule selection
      case 'select_molecule':
        if (params?.molecule) {
          onMoleculeSelect?.(params.molecule);
        }
        break;

      // Database molecule selection
      case 'select_database_molecule':
        if (params?.molecule) {
          onDatabaseMoleculeSelect?.(params.molecule);
        }
        break;

      // FIXED: Trigger Run Simulation button in ControlPanel (Quantum Simulation tab - the YES image)
      case 'trigger_run_simulation':
      case 'run_simulation':
        console.log('Triggering Quantum Simulation (3D molecules tab)...');
        onTabChange?.('simulation'); // Go to Quantum Simulation tab (YES image)
        // Wait for tab to render, then trigger the button
        setTimeout(() => {
          const runBtn = document.querySelector('.run-simulation-btn-modern');
          if (runBtn) {
            console.log('✅ Found Run Simulation button, clicking it...');
            runBtn.click();

            // Poll for simulation completion
            if (params?.wait_for_completion) {
              pollSimulationStatus();
            }
          } else {
            console.warn('❌ Run Simulation button not found');
          }
        }, 800);
        break;

      // Advanced simulations (Bond Scan, Geometry Optimization - the NO image)
      case 'run_advanced_simulation':
      case 'bond_scan':
        onTabChange?.('advanced');
        // Delay to let component render
        setTimeout(() => {
          console.log('Running bond scan...');
          onSimulationRun?.({ type: 'bond_scan', ...params });
        }, 500);
        break;

      case 'geometry_opt':
        onTabChange?.('advanced');
        // Delay to let component render
        setTimeout(() => {
          console.log('Running geometry optimization...');
          onSimulationRun?.({ type: 'geometry_opt', ...params });
        }, 500);
        break;

      case 'design_pesticide':
        onTabChange?.('designer');
        break;

      default:
        console.log('Unknown action:', action);
    }
  };

  // Poll for simulation completion
  const pollSimulationStatus = () => {
    console.log('⏳ Starting to poll simulation status...');
    let pollCount = 0;
    const maxPolls = 120; // Max 2 minutes of polling (1 second intervals)

    const pollInterval = setInterval(() => {
      pollCount++;

      // Check if simulation is still running
      const runBtn = document.querySelector('.run-simulation-btn-modern');
      const isRunning = runBtn?.disabled;

      if (!isRunning) {
        // Simulation completed
        clearInterval(pollInterval);
        console.log('✅ Simulation completed!');

        // Add assistant message about scrolling
        const completionMessage = {
          id: messages.length + 1,
          role: 'assistant',
          content: '✅ Simulation complete! Scroll down to see the results. The energy calculations and molecular properties are now displayed below.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, completionMessage]);
      } else if (pollCount >= maxPolls) {
        // Timeout
        clearInterval(pollInterval);
        console.log('⏱️ Polling timeout');

        const timeoutMessage = {
          id: messages.length + 1,
          role: 'assistant',
          content: '⏱️ Simulation is still running. Scroll down to see the results as they appear.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, timeoutMessage]);
      }
    }, 1000); // Poll every 1 second
  };

  const quickQuestions = [
    'What is quantum computing for agriculture?',
    'How can I use this for my farm?',
    'Tell me about fall armyworm control',
    'What simulations should I run?'
  ];

  if (!isOpen) {
    return (
      <button
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(true)}
        title="Open AI Assistant"
      >
        <MessageCircle size={24} />
        <span className="pulse"></span>
      </button>
    );
  }

  return (
    <div className={`ai-assistant-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="ai-assistant-header">
        <div className="header-content">
          <div className="header-title">
            <Zap size={18} className="header-icon" />
            <span>Rwanda Agriculture AI</span>
          </div>
          {agentInfo && (
            <div className="agent-status">
              <span className="status-dot"></span>
              <span className="status-text">Ready to help</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button
            className="header-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            className="header-btn close-btn"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="ai-assistant-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'assistant' ? (
                    <Zap size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="message-suggestions">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Loader size={16} className="spinning" />
                </div>
                <div className="message-content">
                  <div className="message-text">Thinking...</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="quick-questions">
              <div className="quick-label">
                <HelpCircle size={14} />
                Quick questions:
              </div>
              <div className="quick-buttons">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className="quick-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="ai-assistant-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about quantum agriculture..."
              disabled={loading}
              className="input-field"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="send-btn"
              title="Send message"
            >
              {loading ? <Loader size={18} className="spinning" /> : <Send size={18} />}
            </button>
          </div>

          {/* Footer Info */}
          <div className="ai-assistant-footer">
            <p className="footer-text">
              <Lightbulb size={14} style={{ display: 'inline', marginRight: '6px' }} /> I can help with simulations, molecule design, and farming questions
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
