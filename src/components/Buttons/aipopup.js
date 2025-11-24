// src/components/Buttons/aipopup.js
import React, { useState } from "react";
import styled from "styled-components";

const Popup = () => {
  const [open, setOpen] = useState(false);

  return (
    <StyledWrapper>
      {/* Floating round chat icon (shown when closed) */}
      {!open && (
        <button
          className="ai-chat-toggle"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
        >
          <span className="ai-toggle-icon">AI</span>
        </button>
      )}

      {/* Chat popup (shown when open) */}
      {open && (
        <div className="ai-chat-widget">
          <div className="ai-chat-container">
            {/* Exit / close button */}
            <button
              className="ai-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
            >
              ×
            </button>

            <div className="ai-chat-header">
              <div className="ai-chat-title">AI Assistant</div>
              <div className="ai-chat-subtitle">
                Ask me anything and I'll help you out
              </div>
            </div>

            <div className="ai-chat-messages">
              <div className="ai-message">
                <div className="ai-avatar">AI</div>
                <div className="ai-message-content">
                  Hello! How can I assist you today? I'm here to help with any
                  questions you might have.
                </div>
              </div>
            </div>

            <div className="ai-input-container">
              <textarea
                className="ai-input-field"
                placeholder="Type your message here..."
                defaultValue=""
              />
              <button className="ai-send-button">
                <div className="ai-send-icon" />
              </button>
              <div className="ai-input-info">
                <span className="ai-input-hint">
                  Type your message and press send
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Floating round chat icon */
  .ai-chat-toggle {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #7c3aed, #ec4899);
    box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .ai-chat-toggle:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 14px 30px rgba(124, 58, 237, 0.5);
  }

  .ai-toggle-icon {
    color: #fff;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  /* Popup wrapper */
  .ai-chat-widget {
    --ai-primary: #7c3aed;
    --ai-primary-light: #8b5cf6;
    --ai-secondary: #ec4899;
    --ai-bg-color: #f8fafc;
    --ai-text-color: #1e293b;
    --ai-border-radius: 16px;
    --ai-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
    --ai-transition: all 0.3s ease;

    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, sans-serif;
    color: var(--ai-text-color);
  }

  .ai-chat-container {
    width: 360px;
    max-width: 90vw;
    background: #ffffff;
    border-radius: var(--ai-border-radius);
    box-shadow: var(--ai-shadow);
    overflow: hidden;
    padding: 20px 24px 18px;
    position: relative;
  }

  /* Close (X) button */
  .ai-close-btn {
    position: absolute;
    top: 10px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.2s ease, transform 0.1s ease;
  }

  .ai-close-btn:hover {
    color: #475569;
    transform: scale(1.05);
  }

  .ai-chat-header {
    text-align: center;
    margin-bottom: 18px;
    padding-top: 4px;
  }

  .ai-chat-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ai-chat-subtitle {
    color: #64748b;
    font-size: 13px;
  }

  .ai-chat-messages {
    margin-bottom: 16px;
    max-height: 220px;
    overflow-y: auto;
  }

  .ai-message {
    display: flex;
    margin-bottom: 14px;
  }

  .ai-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    margin-right: 10px;
    flex-shrink: 0;
    font-size: 13px;
  }

  .ai-message-content {
    background-color: #f1f5f9;
    padding: 10px 12px;
    border-radius: 12px;
    flex-grow: 1;
    line-height: 1.45;
    font-size: 13px;
  }

  .ai-input-container {
    position: relative;
    margin-top: 4px;
  }

  .ai-input-field {
    width: 100%;
    padding: 12px 50px 12px 14px;
    border: 2px solid transparent;
    border-radius: 12px;
    background-color: #f1f5f9;
    font-size: 13px;
    resize: none;
    outline: none;
    transition: var(--ai-transition);
    min-height: 52px;
  }

  .ai-input-field:focus {
    border-color: var(--ai-primary-light);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  .ai-send-button {
    position: absolute;
    right: 6px;
    bottom: 6px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--ai-transition);
    outline: none;
  }

  .ai-send-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 14px rgba(124, 58, 237, 0.3);
  }

  .ai-send-button:active {
    transform: scale(0.95);
  }

  .ai-send-icon {
    position: relative;
    width: 14px;
    height: 14px;
  }

  .ai-send-icon:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 14px;
    height: 14px;
    border-top: 2px solid white;
    border-right: 2px solid white;
    transform: rotate(45deg);
  }

  .ai-send-icon:after {
    content: "";
    position: absolute;
    top: 50%;
    left: -5px;
    width: 20px;
    height: 2px;
    background-color: white;
    transform: translateY(-50%) rotate(45deg);
  }

  .ai-input-info {
    display: flex;
    justify-content: flex-start;
    margin-top: 6px;
    font-size: 11px;
    color: #64748b;
  }

  .ai-input-hint {
    opacity: 0.8;
  }

  @media (max-width: 640px) {
    .ai-chat-widget {
      right: 12px;
      bottom: 12px;
    }

    .ai-chat-container {
      width: 320px;
      padding: 18px 18px 16px;
    }

    .ai-chat-toggle {
      right: 12px;
      bottom: 12px;
    }
  }
`;

export default Popup;
