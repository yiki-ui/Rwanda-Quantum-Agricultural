import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import './DisambiguationPanel.css';

const DisambiguationPanel = ({ options, onSelect, context }) => {
    if (!options || options.length === 0) {
        return null;
    }

    return (
        <div className="disambiguation-panel">
            <div className="disambiguation-header">
                <HelpCircle size={18} />
                <span>I found multiple options. Which one did you mean?</span>
            </div>

            <div className="disambiguation-options">
                {options.map((option, index) => (
                    <button
                        key={index}
                        className="disambiguation-option"
                        onClick={() => onSelect(option)}
                    >
                        <div className="option-content">
                            <div className="option-title">
                                <span className="option-number">{index + 1}</span>
                                <span className="option-name">{option.name}</span>
                            </div>
                            {option.description && (
                                <div className="option-description">{option.description}</div>
                            )}
                            {option.context && (
                                <div className="option-context">
                                    <span className="context-label">Context:</span>
                                    <span className="context-value">{option.context}</span>
                                </div>
                            )}
                        </div>
                        <ChevronRight size={18} className="option-arrow" />
                    </button>
                ))}
            </div>

            <div className="disambiguation-footer">
                <p>Or type the number (1-{options.length}) to select</p>
            </div>
        </div>
    );
};

export default DisambiguationPanel;
