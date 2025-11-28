// PaymentTab.js - Redirect to Colleague's AgriPay Standalone Frontend
// Rwanda Quantum Agricultural Intelligence Platform

import React, { useEffect } from 'react';
import { ExternalLink, CreditCard, Shield, Zap } from 'lucide-react';

const PaymentTab = () => {
  const AGRIPAY_URL = 'http://localhost:5173';

  // Auto-open AgriPay in new tab when this component mounts
  useEffect(() => {
    // Automatically open AgriPay in a new tab
    window.open(AGRIPAY_URL, '_blank');
  }, []);

  const openAgriPay = () => {
    window.open(AGRIPAY_URL, '_blank');
  };

  const redirectToAgriPay = () => {
    window.location.href = AGRIPAY_URL;
  };

  return (
    <div className="payment-redirect-tab">
      <div className="redirect-container">
        <div className="redirect-card">
          <div className="agripay-logo">
            <CreditCard size={64} className="logo-icon" />
            <h1>AgriPay Payment System</h1>
          </div>

          <p className="subtitle">
            Secure blockchain payments for agricultural services
          </p>

          <div className="features-grid">
            <div className="feature">
              <Shield size={24} />
              <span>Secure Smart Contracts</span>
            </div>
            <div className="feature">
              <Zap size={24} />
              <span>Instant Transactions</span>
            </div>
            <div className="feature">
              <CreditCard size={24} />
              <span>Multiple Payment Tiers</span>
            </div>
          </div>

          <div className="pricing-preview">
            <h3>Subscription Plans</h3>
            <div className="plans">
              <div className="plan">
                <span className="plan-name">Starter</span>
                <span className="plan-price">$15/month</span>
              </div>
              <div className="plan popular">
                <span className="plan-name">Pro</span>
                <span className="plan-price">$39/month</span>
                <span className="badge">Most Popular</span>
              </div>
              <div className="plan">
                <span className="plan-name">Teams</span>
                <span className="plan-price">$49/month</span>
              </div>
              <div className="plan">
                <span className="plan-name">Enterprise</span>
                <span className="plan-price">Custom</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={openAgriPay} className="open-new-tab-btn">
              <ExternalLink size={20} />
              Open AgriPay in New Tab
            </button>
            <button onClick={redirectToAgriPay} className="redirect-btn">
              Go to AgriPay Payment Portal
            </button>
          </div>

          <div className="info-box">
            <p>
              <strong>Note:</strong> AgriPay runs on <code>localhost:5173</code>
            </p>
            <p className="small-text">
              Make sure the AgriPay frontend is running. If not, start it with:
              <br />
              <code>cd contracts/frontend && npm run dev</code>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-redirect-tab {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .redirect-container {
          max-width: 800px;
          width: 100%;
        }

        .redirect-card {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .agripay-logo {
          margin-bottom: 30px;
        }

        .logo-icon {
          color: #667eea;
          margin-bottom: 20px;
        }

        .agripay-logo h1 {
          font-size: 42px;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 18px;
          color: #718096;
          margin-bottom: 40px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 12px;
          color: #4a5568;
        }

        .feature svg {
          color: #667eea;
        }

        .pricing-preview {
          margin-bottom: 40px;
          padding: 30px;
          background: #f7fafc;
          border-radius: 16px;
        }

        .pricing-preview h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2d3748;
        }

        .plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .plan {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          position: relative;
        }

        .plan.popular {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .plan-name {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .plan-price {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
        }

        .badge {
          position: absolute;
          top: -10px;
          right: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .open-new-tab-btn,
        .redirect-btn {
          padding: 18px 36px;
          border-radius: 12px;
          border: none;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .open-new-tab-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .open-new-tab-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .redirect-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .redirect-btn:hover {
          background: #f7fafc;
          transform: translateY(-2px);
        }

        .info-box {
          background: #edf2f7;
          border: 1px solid #cbd5e0;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
        }

        .info-box p {
          margin: 10px 0;
          color: #4a5568;
          line-height: 1.6;
        }

        .info-box strong {
          color: #2d3748;
        }

        .info-box code {
          background: #2d3748;
          color: #48bb78;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }

        .small-text {
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .redirect-card {
            padding: 40px 20px;
          }

          .agripay-logo h1 {
            font-size: 32px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .plans {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentTab;
