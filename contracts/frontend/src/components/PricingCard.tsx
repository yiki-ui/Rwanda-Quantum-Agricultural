import React from "react";
import "../styles/PricingCard.css";

interface PricingCardProps {
  name: string;
  label?: string;
  price?: string;
  cta: string;
  trial?: string;
  description?: string;
  features?: string[];
  isPopular?: boolean;
  onCtaClick?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  label,
  price,
  cta,
  trial,
  description,
  features = [],
  isPopular = false,
  onCtaClick,
}) => {
  return (
    <div className={`pricing-card ${isPopular ? "pricing-card--popular" : ""}`}>
      {label && <div className="pricing-card__label">{label}</div>}
      <div className="pricing-card__header">
        <h3 className="pricing-card__title">{name}</h3>
        {price && <div className="pricing-card__price">{price}</div>}
      </div>

      {description && (
        <div className="pricing-card__description">{description}</div>
      )}

      {trial && <div className="pricing-card__trial">{trial}</div>}

      {features.length > 0 && (
        <ul className="pricing-card__features">
          {features.map((feature, index) => (
            <li key={index} className="pricing-card__feature">
              <span className="pricing-card__checkmark">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      <button
        className={`pricing-card__cta ${
          isPopular
            ? "pricing-card__cta--primary"
            : "pricing-card__cta--secondary"
        }`}
        onClick={onCtaClick}
      >
        {cta}
      </button>
    </div>
  );
};
