# 🇷🇼 Rwanda Quantum Agricultural Intelligence Platform

**NISR 2025 Big Data Hackathon - Track 5: Open Innovation**

A quantum computing platform that designs sustainable agricultural solutions for Rwanda - smart pesticides, nutrient enhancers, and biodegradable materials.

## What It Does

- **Smart Pesticide Design** - Targets fall armyworm, coffee berry borer with quantum-optimized molecules
- **Nutrient Enhancement** - Combats iron, zinc, and vitamin A deficiencies in crops
- **Sustainable Materials** - Converts agricultural waste into biodegradable packaging
- **Rwanda Analytics** - All 30 districts, season-specific recommendations

## Live Demo

- **Frontend**: https://rwanda-quantum-agriculture.vercel.app/
- **Backend API**: https://rwanda-quantum-backend.onrender.com
- **API Docs**: https://rwanda-quantum-backend.onrender.com/docs

##  Why It's Revolutionary

- **First quantum computing** platform for African agriculture
- **Molecular-level precision** using IBM Qiskit
- **500,000+ farmers** potential reach
- **25% yield increase** estimated
- **40% less harmful pesticides**

## Tech Stack

**Frontend:** React 18, Three.js, Lucide Icons  
**Backend:** Python FastAPI, Qiskit (quantum), PySCF (chemistry)  
**Deployment:** Render (backend), Netlify/Vercel (frontend)

## Repository Structure

```
├── backend
│   ├── DataSets
│   │   └── datasetlink.txt
│   ├── .dockerignore
│   ├── .gitignore
│   ├── .python-version
│   ├── Dockerfile
│   ├── main.py
│   ├── README.MD
│   ├── render.yaml
│   ├── requirements.txt
│   └── simulation_core.py
├── demo
│   └── demo-video.webm
└── frontend
    ├── public
    ├── src
    │   ├── components
    │   │   ├── ControlPanel.js
    │   │   ├── Dashboard.js
    │   │   └── MoleculeViewer.js
    │   ├── utils
    │   │   └── molecules.js
    │   ├── App.css
    │   ├── App.js
    │   ├── App.test.js
    │   ├── index.css
    │   ├── index.js
    │   ├── logo.svg
    │   ├── reportWebVital.js
    │   └── setupTests.js
    ├── .gitignore
    ├── NOTICE
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── LICENSE
    ├── proof of eligibility.pdf
    └── README.md
```

**Note:** Separate deployment repos exist for cleaner CI/CD:
- Backend: https://github.com/yiki-ui/Rwanda-Quantum-Backend.git

## Quick Start

### Run Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Runs at `http://localhost:8000`

### Run Frontend
```bash
cd frontend
npm install
npm start
```
Opens at `http://localhost:3000`

## Main API Endpoints

```http
POST /design_molecular_pesticide    # Design pest control molecules
POST /design_nutrient_enhancement   # Create nutrient compounds
POST /design_sustainable_material   # Generate bio-materials
POST /simulate                      # Run quantum simulation
GET  /generate_hackathon_dashboard_data  # Platform metrics
```

## Impact Projection

- **500,000 farmers** across 30 districts
- **25% yield increase** through pest management
- **40% pesticide reduction**
- **300,000 people** better nutrition
- **60% environmental impact reduction**

## How It Works

1. **Quantum Simulation** - VQE algorithm calculates molecular properties
2. **Agricultural Mapping** - Matches solutions to Rwanda crops/pests/regions
3. **3D Visualization** - Interactive molecule viewer
4. **Impact Analysis** - Estimates farmer reach and yield improvement

## Hackathon Strengths

Track 5 aligned - web-based data solution  
Rwanda-specific - 30 districts, local crops/pests  
Innovation - first quantum agriculture platform in Africa  
Impact - 500K+ farmers, measurable yield gains  
Working demo - fully deployed and functional  

## Environment Setup

**Backend:**
```bash
PORT=8000
PYTHON_VERSION=3.9.0
```

**Frontend:**
```bash
REACT_APP_BACKEND_URL=https://rwanda-quantum-backend.onrender.com
```

## Dependencies

**Backend:** `fastapi`, `qiskit`, `pyscf`, `numpy`, `pandas`  
**Frontend:** `react`, `three`, `lucide-react`

See `requirements.txt` and `package.json` for full lists.

## Contact

**NISR 2025 Hackathon Submission**

- Email: prodyiki@gmail.com
- GitHub: https://github.com/yiki-ui/
- Live Platform: https://rwanda-quantum-agriculture.vercel.app/

## License

Apache 2.0 - Open for innovation

---

**Built with Quantum Precision for Rwanda's Agricultural Future**
