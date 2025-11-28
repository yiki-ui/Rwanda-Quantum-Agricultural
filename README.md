# Rwanda Quantum Agricultural Intelligence Platform

## Overview

The Rwanda Quantum Agricultural Intelligence Platform is an innovative solution developed for the NISR 2025 Big Data Hackathon (Track 5: Open Innovation). This platform leverages quantum computing and molecular simulation to advance sustainable agriculture in Rwanda through precision farming and data-driven decision making.

## Project Description

This platform combines quantum molecular simulation with geospatial intelligence to provide farmers, researchers, and agricultural stakeholders with advanced tools for optimizing crop yields, understanding soil chemistry, and making informed decisions about fertilizers and agricultural inputs. By simulating molecular interactions at the quantum level, the platform enables unprecedented insights into agricultural processes.

## Key Features

### Quantum Molecular Simulation
- Real-time quantum simulations using Qiskit for molecular analysis
- Subatomic particle visualization and molecular structure design
- ADMET (Absorption, Distribution, Metabolism, Excretion, Toxicity) property prediction
- Spectroscopy analysis for compound identification
- 3D molecular visualization with interactive controls

### Rwanda-Specific Agricultural Intelligence
- Interactive GIS mapping of all 30 districts in Rwanda
- District-level agricultural data visualization using Leaflet and OpenGlobus
- Geospatial analysis for precision agriculture
- Regional crop optimization recommendations
- Soil chemistry analysis specific to Rwandan agricultural zones

### Advanced Analytics Dashboard
- Platform performance metrics and usage statistics
- Rwanda agricultural coverage visualization
- Impact assessment tools for policy makers
- Interactive charts and data visualizations using Recharts
- PDF export functionality for reports and presentations

### Molecular Database Management
- Comprehensive database of agricultural compounds and molecules
- Search and filter capabilities for molecular structures
- Import/export functionality for molecular data
- Similarity analysis between molecular structures
- Designed molecules library for agricultural applications

### AI-Powered Assistant
- Natural language interface for platform navigation
- Context-aware assistance for quantum simulations
- Automated workflow execution
- Integration with Groq API for intelligent responses

### Blockchain Payment System
- Ethereum-based smart contracts for agricultural payments
- Tiered subscription model for platform access
- Credit-based service system
- Secure and transparent payment processing
- Upgradeable contract architecture using OpenZeppelin

### Progressive Web Application
- Offline-first architecture with service workers
- Responsive design for mobile and desktop
- Fast loading and caching strategies
- Works in low-connectivity environments

## Technology Stack

### Frontend
- React 19.1.1 for UI components
- Three.js and React Three Fiber for 3D visualizations
- Leaflet and React Leaflet for mapping
- OpenGlobus for advanced geospatial rendering
- 3Dmol.js for molecular structure visualization
- Recharts for data analytics
- Ethers.js for blockchain integration
- Workbox for PWA functionality

### Backend
- FastAPI for high-performance REST API
- Python 3.x with scientific computing stack
- Qiskit for quantum simulations
- PySCF for quantum chemistry calculations
- NumPy, Pandas, and SciPy for data processing
- SQLite for molecular database storage
- Uvicorn ASGI server

### Blockchain
- Solidity smart contracts
- Hardhat development environment
- OpenZeppelin contracts for security and upgradeability
- Ethers.js for Web3 integration

## Project Structure

```
Rwanda-Quantum-Agriculture/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # API and service integrations
│   │   ├── contexts/     # React context providers
│   │   └── contracts/    # Smart contract ABIs
│   └── public/           # Static assets and PWA configuration
├── backend/              # Python FastAPI server
│   ├── main.py          # API endpoints
│   ├── simulation_core.py    # Quantum simulation engine
│   ├── molecular_database.py # Database operations
│   ├── ai_agent.py      # AI assistant logic
│   └── processed_gis/   # Rwanda district GeoJSON data
├── contracts/           # Ethereum smart contracts
│   ├── contracts/       # Solidity source files
│   └── scripts/         # Deployment scripts
└── start-blockchain.sh  # Local blockchain startup script
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.9 or higher
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file with necessary configuration
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Blockchain Setup (Optional)

1. Navigate to the contracts directory:
```bash
cd contracts
```

2. Install dependencies:
```bash
npm install
```

3. Compile contracts:
```bash
npm run compile
```

4. Run local blockchain and deploy:
```bash
cd ..
./start-blockchain.sh
```

## Usage

### Running Quantum Simulations
1. Navigate to the Simulation tab
2. Select or design a molecule
3. Configure simulation parameters
4. Execute quantum simulation
5. Analyze results and visualizations

### Exploring Rwanda Agricultural Data
1. Access the Rwanda Agricultural Intelligence tab
2. Select a district on the interactive map
3. View district-specific agricultural data
4. Analyze soil chemistry and crop recommendations

### Using the AI Assistant
1. Click the AI Assistant button
2. Ask questions in natural language
3. Request specific simulations or data
4. Navigate the platform using voice commands

### Accessing Analytics
1. Navigate to the Analytics dashboard
2. View platform metrics and usage statistics
3. Generate reports for stakeholders
4. Export data as PDF for presentations

## Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest

# Smart contract tests
cd contracts
npm test
```

### Building for Production
```bash
# Frontend production build
cd frontend
npm run build

# Backend deployment
cd backend
# Configure production environment variables
# Deploy using your preferred hosting service
```

## Contributing

This project was developed for the NISR 2025 Big Data Hackathon. Contributions, suggestions, and feedback are welcome.

## License

See LICENSE file for details.

## Acknowledgments

- National Institute of Statistics of Rwanda (NISR) for organizing the hackathon
- Qiskit and IBM Quantum for quantum computing frameworks
- OpenZeppelin for secure smart contract libraries
- The open-source community for various tools and libraries used in this project

## Contact

For questions, support, or collaboration opportunities, please refer to the proof of eligibility documentation included in this repository.
# agri-quantum
