# Agricultural Payment System - UI Implementation Guide

## Pricing UI Overview

The Agricultural Payment System now features a modern, professional pricing interface with two main views:

### 1. **Pricing Page** (Default View)
- Displays all subscription tiers in a responsive card grid
- Features a "MOST POPULAR" badge on the Pro tier
- Includes feature lists with checkmark icons
- Dark theme with green accent colors
- Responsive layout (4-column on desktop, 2-column on tablet, 1-column on mobile)

### 2. **Subscribe Page**
- Direct subscription interface with wallet integration
- Dropdown tier selection
- QR code generation for payment
- Real-time wallet connection status

---

## File Structure

```
frontend/src/
├── components/
│   ├── PricingCard.tsx          # Individual pricing card component
│   ├── PricingPage.tsx          # Full pricing page layout
│   └── index.ts                 # Component exports
├── styles/
│   ├── PricingCard.css          # Pricing card styling
│   └── PricingPage.css          # Pricing page layout & animations
├── App.tsx                      # Main app with tab navigation
├── App.css                      # Global app styles & navigation
└── index.css                    # Global CSS variables
```

---

## Design System

### Color Palette
- **Primary Background**: `#0f3460` (Dark Blue)
- **Secondary Background**: `#1a1a2e` (Very Dark Blue)
- **Accent Color**: `#00d084` (Green)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#b0b0b0` (Gray)

### Typography
- **Font Family**: System fonts (-apple-system, Segoe UI, Roboto)
- **Font Sizes**:
  - H1/Page Title: `3rem` (desktop), `2rem` (mobile)
  - H2/Section Title: `2rem` (desktop), `1.5rem` (mobile)
  - H3/Card Title: `1.5rem` (desktop), `1.25rem` (mobile)
  - Body Text: `1rem` (desktop), `0.95rem` (mobile)

### Spacing
- **Padding**: `2.5rem` (card), `2rem` (section), `1rem` (elements)
- **Gap**: `2rem` (card grid), `1rem` (elements)
- **Border Radius**: `16px` (cards), `10px` (buttons), `8px` (inputs)

### Visual Effects
- **Shadows**: `0 10px 30px rgba(0, 0, 0, 0.3)` (cards), `0 4px 15px` (buttons)
- **Backdrop Filter**: `blur(10px)` (navigation, modals)
- **Transitions**: `0.3s cubic-bezier(0.4, 0, 0.2, 1)` (smooth movement)

---

## Pricing Tiers

### Starter - $15/month
- **Credits**: 100/month
- **Features**:
  - Up to 5 projects
  - Basic analytics
  - Community support
  - 100 credits/month
- **CTA**: "Choose Starter" (Secondary button)

### Pro - $39/month (MOST POPULAR)
- **Credits**: 500/month
- **Features**:
  - Unlimited projects
  - Advanced analytics
  - Priority support
  - 500 credits/month
  - Custom branding
  - API access
- **CTA**: "Choose Pro" (Primary button)
- **Special**: Featured with green glow, 5% scale increase

### Teams - $49/month
- **Credits**: 500/month
- **Features**:
  - Everything in Pro
  - Team collaboration
  - Advanced permissions
  - Audit logs
  - SSO integration
  - Dedicated support
- **CTA**: "Get Teams" (Secondary button)

### Enterprise - Custom
- **Pricing**: Custom (Book demo)
- **Features**:
  - Custom pricing
  - Advanced security
  - SLA guarantee
  - On-premises deployment
  - Custom integrations
  - Dedicated account manager
- **CTA**: "Book demo" (Secondary button)

---

## Component API

### PricingCard

```typescript
interface PricingCardProps {
  name: string;                    // Tier name
  label?: string;                  // e.g., "MOST POPULAR"
  price?: string;                  // e.g., "$39 per editor/month"
  cta: string;                     // Call-to-action text
  trial?: string;                  // Trial info
  description?: string;            // Enterprise description
  features?: string[];             // Feature list
  isPopular?: boolean;             // Highlight as popular
  onCtaClick?: () => void;        // CTA click handler
}
```

### PricingPage

- No props required
- Displays all 4 tiers in a responsive grid
- Includes header and footer sections
- Animations on load

---

## Navigation & Tabs

The app has two main views accessible via navigation bar:

1. **Pricing** - Browse subscription tiers
2. **Subscribe** - Purchase subscription with wallet integration

### Navigation Features
- Sticky header with brand name
- Active tab highlighting
- Wallet connection button
- Responsive mobile menu

---

## Responsive Breakpoints

| Breakpoint | Width | Grid Cols | Behavior |
|------------|-------|-----------|----------|
| Desktop | 1200px+ | 4 | Full featured |
| Tablet | 768px-1199px | 2 | Card scaling adjusted |
| Mobile | 480px-767px | 1 | Stacked layout |
| Mobile S | <480px | 1 | Compact mode |

---

## Features Implemented

✅ **Design**
- Modern dark theme with green accents
- Smooth animations and transitions
- Professional typography
- Consistent spacing and sizing

✅ **Layout**
- Responsive grid system
- Mobile-first approach
- Flexible component structure
- Proper alignment and positioning

✅ **Interactive Elements**
- Hover effects on cards
- Button press animations
- Tab switching
- Wallet connection

✅ **Accessibility**
- Clear visual hierarchy
- Good color contrast
- Readable font sizes
- Semantic HTML structure

✅ **Performance**
- CSS Grid for efficient layout
- Hardware acceleration via transforms
- Optimized animations
- Lazy component loading

---

## Usage Examples

### Using PricingCard Component
```tsx
<PricingCard
  name="Pro"
  label="MOST POPULAR"
  price="$39 per editor/month"
  cta="Choose Pro"
  trial="Free for 14 days! Cancel anytime"
  features={[
    "Unlimited projects",
    "Advanced analytics",
    "Priority support"
  ]}
  isPopular={true}
  onCtaClick={() => console.log("Pro selected")}
/>
```

### Using PricingPage Component
```tsx
import { PricingPage } from './components/PricingPage';

export function MyApp() {
  return <PricingPage />;
}
```

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## Future Enhancements

1. **Testimonials Section** - Add customer reviews
2. **Comparison Table** - Feature comparison matrix
3. **FAQ Section** - Common questions
4. **Live Chat** - Customer support integration
5. **Analytics** - Track tier selection events
6. **Discount Codes** - Promotional pricing
7. **Annual Billing** - Save 20% on yearly plans
8. **Payment Integration** - Stripe/PayPal checkout

---

## Customization Guide

### Changing Colors
Edit color values in `App.css` and component CSS files:
```css
--primary-accent: #00d084;
--primary-bg: #0f3460;
--text-primary: #ffffff;
```

### Adding New Tiers
Update `PRICING_TIERS` array in `PricingPage.tsx`:
```typescript
{
  name: "Tier Name",
  price: "$X per month",
  cta: "Button Text",
  features: ["Feature 1", "Feature 2"],
  isPopular: false
}
```

### Adjusting Spacing
Modify CSS variables or inline values in component files

### Changing Animations
Update `transition` and `animation` properties in CSS files

---

## Support & Maintenance

For questions or issues:
1. Check the component props documentation
2. Review CSS files for styling customization
3. Ensure all imports are correct
4. Clear browser cache if styles don't update
5. Restart dev server for new component changes

---

**Last Updated**: November 27, 2025
**Version**: 1.0
**Status**: Production Ready
