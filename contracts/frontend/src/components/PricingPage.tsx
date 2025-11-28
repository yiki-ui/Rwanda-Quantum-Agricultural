import React from "react";
import { PricingCard } from "./PricingCard";
import "../styles/PricingPage.css";

interface PricingTier {
  name: string;
  label?: string;
  price?: string;
  cta: string;
  trial?: string;
  description?: string;
  features?: string[];
  isPopular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$15 per month",
    cta: "Choose Starter",
    trial: "Free for 14 days! Cancel anytime",
    features: [
      "Up to 5 projects",
      "Basic analytics",
      "Community support",
      "100 credits/month",
    ],
  },
  {
    name: "Pro",
    label: "MOST POPULAR",
    price: "$39 per editor/month",
    cta: "Choose Pro",
    trial: "Free for 14 days! Cancel anytime",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "500 credits/month",
      "Custom branding",
      "API access",
    ],
    isPopular: true,
  },
  {
    name: "Teams",
    price: "$49 per editor/month",
    cta: "Get Teams",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Advanced permissions",
      "Audit logs",
      "SSO integration",
      "Dedicated support",
    ],
  },
  {
    name: "Enterprise",
    cta: "Book demo",
    description:
      "For businesses with advanced security, compliance, & deployment needs",
    features: [
      "Custom pricing",
      "Advanced security",
      "SLA guarantee",
      "On-premises deployment",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
];

export const PricingPage: React.FC = () => {
  const handleCTA = (tierName: string) => {
    alert(`${tierName} tier selected! Proceeding to checkout...`);
    // TODO: Implement actual subscription flow
  };

  return (
    <div className="pricing-page">
      <div className="pricing-page__header">
        <h1 className="pricing-page__title">Simple, Transparent Pricing</h1>
        <p className="pricing-page__subtitle">
          Choose the perfect plan for your agricultural needs
        </p>
      </div>

      <div className="pricing-page__container">
        <div className="pricing-cards">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.name}
              {...tier}
              onCtaClick={() => handleCTA(tier.name)}
            />
          ))}
        </div>
      </div>

      <div className="pricing-page__footer">
        <p>
          All plans include 24/7 support and a free 14-day trial. No credit card
          required.
        </p>
      </div>
    </div>
  );
};
