import React, { useState, useEffect } from 'react';
import { Upload, Search, Database, Atom, Beaker, Leaf, Download, Eye, Trash2, Plus, BarChart3, Filter, RefreshCw, Settings, TrendingUp, Activity } from 'lucide-react';

function MolecularDatabase({ onMoleculeSelect, selectedMoleculeId }) {
  const [molecules, setMolecules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  
  // Enhanced database management states
  const [activeView, setActiveView] = useState('molecules'); // 'molecules', 'statistics', 'cache'
  const [advancedFilters, setAdvancedFilters] = useState({
    minAtoms: '',
    maxAtoms: '',
    minWeight: '',
    maxWeight: '',
    hasSimulation: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    loadMolecules();
    loadDatabaseStats();
    loadCacheStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    if (activeView === 'molecules') {
      loadMolecules();
    }
  }, [advancedFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMolecules = async () => {
    try {
      const searchParams = {
        query: searchQuery || null,
        category: selectedCategory || null,
        limit: 50
      };
      
      // Add advanced filters if they are set
      if (advancedFilters.minAtoms) searchParams.min_atoms = parseInt(advancedFilters.minAtoms);
      if (advancedFilters.maxAtoms) searchParams.max_atoms = parseInt(advancedFilters.maxAtoms);
      if (advancedFilters.minWeight) searchParams.min_weight = parseFloat(advancedFilters.minWeight);
      if (advancedFilters.maxWeight) searchParams.max_weight = parseFloat(advancedFilters.maxWeight);
      if (advancedFilters.hasSimulation) searchParams.has_simulation = true;
      
      const response = await fetch('http://localhost:8000/search_molecules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      const data = await response.json();
      if (data.success) {
        setMolecules(data.molecules);
      }
    } catch (error) {
      console.error('Error loading molecules:', error);
      // Fallback demo data
      setMolecules([
        {
          id: 1,
          name: 'Caffeine',
          category: 'general',
          num_atoms: 24,
          molecular_weight: 194.19,
          description: 'Natural stimulant compound'
        },
        {
          id: 2,
          name: 'Glucose',
          category: 'nutrient',
          num_atoms: 24,
          molecular_weight: 180.16,
          description: 'Simple sugar molecule'
        }
      ]);
    }
  };

  const loadDatabaseStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('http://localhost:8000/database_stats');
      const data = await response.json();
      if (data.success) {
        setDbStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
      // Fallback demo data
      setDbStats({
        total_molecules: 1247,
        total_simulations: 3891,
        molecules_by_category: {
          general: 456,
          pesticide: 234,
          nutrient: 189,
          material: 298,
          sub_atomic_designed: 70
        },
        avg_molecular_weight: 245.7
      });
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  const loadCacheStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/cache_stats');
      const data = await response.json();
      if (data.success) {
        setCacheStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading cache stats:', error);
      // Fallback demo data
      setCacheStats({
        cache_size: 156,
        hit_rate: 0.87,
        total_hits: 2341,
        total_misses: 350,
        cache_memory_mb: 45.2
      });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('name', uploadName || uploadFile.name.split('.')[0]);
    formData.append('category', uploadCategory);
    formData.append('description', uploadDescription);

    try {
      const response = await fetch('http://localhost:8000/upload_molecule_file', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadName('');
        setUploadDescription('');
        loadMolecules();
        loadDatabaseStats();
      }
    } catch (error) {
      console.error('Error uploading molecule:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = () => {
    loadMolecules();
  };
  
  const handleFilterChange = (filterName, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  const clearFilters = () => {
    setAdvancedFilters({
      minAtoms: '',
      maxAtoms: '',
      minWeight: '',
      maxWeight: '',
      hasSimulation: false
    });
    setSearchQuery('');
    setSelectedCategory('');
  };
  
  const refreshData = () => {
    if (activeView === 'molecules') {
      loadMolecules();
    }
    loadDatabaseStats();
    loadCacheStats();
  };

  return (
    <div className="molecular-database">
      <div className="database-header">
        <h3><Database className="inline-icon" /> Molecular Database</h3>
        <div className="database-quick-stats">
          {dbStats && (
            <div className="quick-stats-grid">
              <div className="quick-stat-item">
                <span className="quick-stat-value">{dbStats.total_molecules}</span>
                <span className="quick-stat-label">Molecules</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-value">{dbStats.total_simulations}</span>
                <span className="quick-stat-label">Simulations</span>
              </div>
              {cacheStats && (
                <div className="quick-stat-item">
                  <span className="quick-stat-value">{(cacheStats.hit_rate * 100).toFixed(0)}%</span>
                  <span className="quick-stat-label">Cache Hit</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* View Selector */}
      <div className="view-selector">
        <button 
          className={`view-btn ${activeView === 'molecules' ? 'active' : ''}`}
          onClick={() => setActiveView('molecules')}
        >
          <Database size={16} />
          Molecules
        </button>
        <button 
          className={`view-btn ${activeView === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveView('statistics')}
        >
          <BarChart3 size={16} />
          Statistics
        </button>
        <button 
          className={`view-btn ${activeView === 'cache' ? 'active' : ''}`}
          onClick={() => setActiveView('cache')}
        >
          <Activity size={16} />
          Cache Management
        </button>
      </div>

      {activeView === 'molecules' && (
        <>
          <div className="database-controls">
            <div className="search-section">
              <div className="search-input-group">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search molecules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="pesticide">Pesticides</option>
                <option value="nutrient">Nutrients</option>
                <option value="material">Materials</option>
                <option value="sub_atomic_designed">Sub-Atomic Designed</option>
                <option value="general">General</option>
              </select>
              <button onClick={handleSearch} className="search-btn">Search</button>
            </div>
            
            <div className="control-actions">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`filter-btn ${showAdvancedFilters ? 'active' : ''}`}
              >
                <Filter size={16} /> Advanced Filters
              </button>
              <button onClick={refreshData} className="refresh-btn">
                <RefreshCw size={16} /> Refresh
              </button>
              <button 
                onClick={() => setShowUploadModal(true)} 
                className="upload-btn"
              >
                <Upload size={16} /> Upload
              </button>
            </div>
          </div>
          
          {showAdvancedFilters && (
            <div className="advanced-filters">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Atom Count Range</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={advancedFilters.minAtoms}
                      onChange={(e) => handleFilterChange('minAtoms', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={advancedFilters.maxAtoms}
                      onChange={(e) => handleFilterChange('maxAtoms', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Molecular Weight (g/mol)</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Min"
                      value={advancedFilters.minWeight}
                      onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={advancedFilters.maxWeight}
                      onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={advancedFilters.hasSimulation}
                      onChange={(e) => handleFilterChange('hasSimulation', e.target.checked)}
                    />
                    Has Simulation Results
                  </label>
                </div>
              </div>
              
              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-btn">
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="molecules-grid">
            {molecules.map((molecule) => (
              <div 
                key={molecule.id} 
                className={`molecule-card ${selectedMoleculeId === molecule.id ? 'selected' : ''}`}
                onClick={() => onMoleculeSelect && onMoleculeSelect(molecule)}
              >
                <div className="molecule-header">
                  <h4>{molecule.name}</h4>
                  <span className={`category-badge ${molecule.category}`}>
                    {molecule.category}
                  </span>
                </div>
                
                <div className="molecule-properties">
                  <div className="property">
                    <Atom size={14} />
                    <span>{molecule.num_atoms} atoms</span>
                  </div>
                  <div className="property">
                    <Beaker size={14} />
                    <span>{molecule.molecular_weight?.toFixed(1)} g/mol</span>
                  </div>
                </div>
                
                {molecule.description && (
                  <p className="molecule-description">{molecule.description}</p>
                )}
                
                <div className="molecule-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoleculeSelect && onMoleculeSelect(molecule);
                    }}
                    className="action-btn"
                  >
                    <Eye size={14} /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {activeView === 'statistics' && (
        <div className="statistics-view">
          <div className="stats-header">
            <h4><BarChart3 className="inline-icon" /> Database Statistics</h4>
            <button onClick={refreshData} className="refresh-btn" disabled={isLoadingStats}>
              <RefreshCw size={16} className={isLoadingStats ? 'spinning' : ''} />
              {isLoadingStats ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {dbStats && (
            <div className="detailed-stats">
              <div className="stats-section">
                <h5>Overview</h5>
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon"><Database size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-number">{dbStats.total_molecules}</span>
                      <span className="stat-title">Total Molecules</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><Activity size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-number">{dbStats.total_simulations}</span>
                      <span className="stat-title">Simulations Run</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><TrendingUp size={24} /></div>
                    <div className="stat-content">
                      <span className="stat-number">{dbStats.avg_molecular_weight?.toFixed(1)}</span>
                      <span className="stat-title">Avg. Mol. Weight</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stats-section">
                <h5>Molecules by Category</h5>
                <div className="category-stats">
                  {Object.entries(dbStats.molecules_by_category || {}).map(([category, count]) => (
                    <div key={category} className="category-item">
                      <div className="category-info">
                        <span className={`category-badge ${category}`}>{category}</span>
                        <span className="category-count">{count} molecules</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ width: `${(count / dbStats.total_molecules) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeView === 'cache' && (
        <div className="cache-view">
          <div className="cache-header">
            <h4><Activity className="inline-icon" /> Simulation Cache Management</h4>
            <button onClick={refreshData} className="refresh-btn">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
          
          {cacheStats && (
            <div className="cache-stats">
              <div className="cache-overview">
                <div className="cache-cards">
                  <div className="cache-card">
                    <div className="cache-metric">
                      <span className="cache-value">{cacheStats.cache_size}</span>
                      <span className="cache-label">Cached Simulations</span>
                    </div>
                  </div>
                  <div className="cache-card">
                    <div className="cache-metric">
                      <span className="cache-value">{(cacheStats.hit_rate * 100).toFixed(1)}%</span>
                      <span className="cache-label">Hit Rate</span>
                    </div>
                  </div>
                  <div className="cache-card">
                    <div className="cache-metric">
                      <span className="cache-value">{cacheStats.cache_memory_mb?.toFixed(1)} MB</span>
                      <span className="cache-label">Memory Usage</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cache-details">
                <div className="cache-performance">
                  <h5>Cache Performance</h5>
                  <div className="performance-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Total Hits:</span>
                      <span className="metric-value">{cacheStats.total_hits}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Total Misses:</span>
                      <span className="metric-value">{cacheStats.total_misses}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Hit Ratio:</span>
                      <span className="metric-value">
                        {cacheStats.total_hits}:{cacheStats.total_misses}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="cache-actions">
                  <h5>Cache Management</h5>
                  <div className="management-buttons">
                    <button className="cache-action-btn">
                      <RefreshCw size={16} />
                      Clear Cache
                    </button>
                    <button className="cache-action-btn">
                      <Download size={16} />
                      Export Cache Stats
                    </button>
                    <button className="cache-action-btn">
                      <Settings size={16} />
                      Cache Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upload Molecule File</h3>
              <button onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>File (SDF, MOL, XYZ, PDB)</label>
                <input
                  type="file"
                  accept=".sdf,.mol,.xyz,.pdb"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </div>
              
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Molecule name"
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={uploadCategory} 
                  onChange={(e) => setUploadCategory(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="nutrient">Nutrient</option>
                  <option value="material">Material</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Molecule description"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button 
                onClick={handleFileUpload} 
                disabled={!uploadFile || isUploading}
                className="primary"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MolecularDatabase;
