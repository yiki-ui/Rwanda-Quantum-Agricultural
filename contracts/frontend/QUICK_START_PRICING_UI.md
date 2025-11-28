# Quick Start: Pricing UI

## 🚀 Getting Started

The pricing UI is now live at **http://localhost:5173**

### Default View: Pricing Page
You'll see 4 subscription tiers displayed in an attractive card layout:
- **Starter** - $15/month
- **Pro** - $39/month (highlighted as MOST POPULAR)
- **Teams** - $49/month
- **Enterprise** - Custom pricing

### Navigation Tabs

#### Pricing Tab (Default)
- Browse all subscription options
- See features for each tier
- Hover cards for animations
- Desktop: 4 cards in a row
- Mobile: Stacked single column

#### Subscribe Tab
- Connect your MetaMask wallet
- Select a subscription tier
- Generate QR code for payment
- Complete blockchain transaction

---

## 💡 Key Features

### Visual Design
- **Dark Theme**: Professional navy blue background
- **Green Accents**: `#00d084` for highlights
- **Pro Card**: Special emphasis with green glow
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works on all devices

### Interactive Elements
- Click tabs to switch views
- Connect wallet button (top right)
- Hover cards for lift animation
- Click CTA buttons for actions
- Generate QR codes on demand

### Wallet Integration
- MetaMask support
- Display connected address
- QR code payment option
- Direct blockchain interaction

---

## 📊 Pricing Tiers

### Starter - $15/month
- 100 credits/month
- 5 projects
- Basic analytics
- Community support
- **Button**: Choose Starter

### Pro - $39/month (⭐ MOST POPULAR)
- 500 credits/month
- Unlimited projects
- Advanced analytics
- Priority support
- Custom branding
- API access
- **Button**: Choose Pro
- **Highlight**: Green border + glow

### Teams - $49/month
- 500 credits/month
- Everything in Pro
- Team collaboration
- Advanced permissions
- Audit logs
- SSO integration
- **Button**: Get Teams

### Enterprise - Custom
- Custom pricing
- Advanced security
- SLA guarantee
- On-premises deployment
- Custom integrations
- Dedicated account manager
- **Button**: Book demo

---

## 🎨 Customization

### Colors
Edit in `src/App.css`:
```css
/* Primary accent green */
color: #00d084;

/* Dark backgrounds */
background: #0f3460;
background: #1a1a2e;
```

### Pricing Information
Edit in `src/components/PricingPage.tsx`:
```typescript
const PRICING_TIERS = [
  {
    name: "Tier Name",
    price: "$X per month",
    cta: "Button Text",
    features: ["Feature 1", "Feature 2"],
    isPopular: false
  }
]
```

### Styling
- Card styles: `src/styles/PricingCard.css`
- Layout styles: `src/styles/PricingPage.css`
- Global styles: `src/App.css`

---

## 🔧 Development

### Start Dev Server
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### File Structure
```
frontend/src/
├── components/
│   ├── PricingCard.tsx
│   └── PricingPage.tsx
├── styles/
│   ├── PricingCard.css
│   └── PricingPage.css
├── App.tsx
└── App.css
```

---

## 📱 Responsive Design

| Device | Layout | Grid |
|--------|--------|------|
| Desktop 1200px+ | Full featured | 4 cols |
| Tablet 768-1199px | Optimized | 2 cols |
| Mobile 480-767px | Stacked | 1 col |
| Mobile <480px | Compact | 1 col |

### Mobile Features
- Touch-friendly buttons
- Large readable text
- Proper spacing
- Quick interactions

---

## 💻 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## 🆘 Troubleshooting

### Styles Not Updating
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+Shift+R)
3. Restart dev server

### Components Not Showing
1. Check browser console for errors
2. Verify file imports in App.tsx
3. Ensure CSS files are in `src/styles/`

### Wallet Not Connecting
1. Install MetaMask extension
2. Make sure you're on localhost:5173
3. Check browser permissions

### QR Code Not Generating
1. Connect wallet first
2. Select a subscription tier
3. Click "Generate QR Code" button
4. QR code appears in Subscribe tab

---

## 📚 More Information

- **Full Documentation**: See `PRICING_UI_GUIDE.md`
- **Implementation Details**: See `PRICING_UI_IMPLEMENTATION.md`
- **Project Overview**: See `README_RWANDA_AGRI.md`

---

## ✨ Features at a Glance

✅ Beautiful pricing cards
✅ Responsive design
✅ Dark theme
✅ Green accent colors
✅ Smooth animations
✅ Wallet integration
✅ QR code payment
✅ Mobile optimized
✅ Professional styling
✅ Easy customization

---

**Enjoy using AgriPay Pricing UI!** 🎉
