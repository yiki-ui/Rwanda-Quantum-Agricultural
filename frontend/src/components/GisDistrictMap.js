import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader, Eye, EyeOff } from 'lucide-react';
import { Globe, Entity, LonLat, GlobusTerrain, XYZ, control, EntityCollection } from '@openglobus/og';
import '@openglobus/og/styles';

const GisDistrictMap = ({ selectedDistrict, onDistrictSelect, apiBaseUrl }) => {
  const containerRef = useRef(null);
  const globusRef = useRef(null);
  const entityCollectionRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtEntities, setDistrictEntities] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [globusReady, setGlobusReady] = useState(false);

  const baseUrl = apiBaseUrl || 'http://localhost:8000';

  // Load OpenGlobus library - REMOVED (using npm package)

  // Initialize OpenGlobus
  useEffect(() => {
    if (!containerRef.current || globusRef.current) return;

    try {
      console.log('Initializing OpenGlobus...');

      const globus = new Globe({
        target: containerRef.current,
        name: 'Rwanda Districts',
        terrain: new GlobusTerrain(),
        layers: [
          new XYZ('OpenStreetMap', {
            isBaseLayer: true,
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            visibility: true,
            attribution: '© OpenStreetMap contributors'
          })
        ],
        autoActivated: true
      });

      // Add controls
      globus.planet.addControl(new control.SimpleNavigation());
      globus.planet.addControl(new control.LayerSwitcher());

      // Set view to Rwanda
      globus.planet.viewExtentArr([28.8, -2.9, 30.9, -1.0]);

      globusRef.current = globus;

      // Create entity collection for districts
      const entityCollection = new EntityCollection();
      entityCollection.addTo(globus.planet);
      entityCollectionRef.current = entityCollection;

      setGlobusReady(true);
      console.log('OpenGlobus initialized successfully');

    } catch (err) {
      console.error('Error initializing OpenGlobus:', err);
      setError(`Failed to initialize map: ${err.message}`);
      setLoading(false);
    }

    return () => {
      if (globusRef.current) {
        console.log('Destroying OpenGlobus');
        try {
          globusRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying globe:', e);
        }
        globusRef.current = null;
      }
    };
  }, []);

  // Add district to map with both heatmap and boundaries
  const addDistrictToMap = useCallback((feature) => {
    if (!globusRef.current) return null;

    try {
      const globus = globusRef.current;
      const props = feature.properties;
      const geom = feature.geometry;

      if (!geom || !geom.coordinates) {
        console.warn(`No coordinates for district: ${props.NAME_2}`);
        return null;
      }

      let coordinates = [];
      if (geom.type === 'Polygon') {
        coordinates = geom.coordinates;
      } else if (geom.type === 'MultiPolygon') {
        coordinates = geom.coordinates[0] || [];
      } else {
        console.warn(`Unsupported geometry type: ${geom.type}`);
        return null;
      }

      if (!coordinates.length || !coordinates[0]) {
        console.warn(`Empty coordinates for district: ${props.NAME_2}`);
        return null;
      }

      const coords = coordinates[0];

      // Generate soil quality score for heatmap
      const hash = props.NAME_2.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const soilQuality = Math.abs(hash % 100) / 100;

      // Color gradient for heatmap
      let heatmapColor, boundaryColor;
      if (soilQuality < 0.33) {
        heatmapColor = 'rgba(255, 68, 68, 0.4)'; // Red
      } else if (soilQuality < 0.66) {
        heatmapColor = 'rgba(255, 170, 68, 0.4)'; // Orange
      } else {
        heatmapColor = 'rgba(68, 255, 68, 0.4)'; // Green
      }
      boundaryColor = 'rgba(0, 255, 0, 0.15)';

      const entities = [];

      // Add heatmap polygon
      if (showHeatmap) {
        const heatmapEntity = new Entity({
          name: `${props.NAME_2}_heatmap`,
          lonlat: [coords[0][0], coords[0][1]],
          polygon: {
            coordinates: coords.map(c => [c[0], c[1], 0]),
            style: {
              fillColor: heatmapColor,
              lineColor: 'transparent'
            }
          },
          properties: {
            districtName: props.NAME_2,
            type: 'heatmap',
            soilQuality
          }
        });

        entityCollectionRef.current.add(heatmapEntity);
        entities.push(heatmapEntity);
        console.log(`Created heatmap entity for ${props.NAME_2}, has polygon:`, !!heatmapEntity.polygon);
      }

      // Add boundary polygon
      if (showDistricts) {
        const boundaryEntity = new Entity({
          name: `${props.NAME_2}_boundary`,
          lonlat: [coords[0][0], coords[0][1]],
          polygon: {
            coordinates: coords.map(c => [c[0], c[1], 0]),
            style: {
              fillColor: boundaryColor,
              lineColor: 'rgba(0, 255, 0, 0.6)',
              lineWidth: 2
            }
          },
          properties: {
            districtName: props.NAME_2,
            type: 'boundary'
          }
        });

        // Note: Click handlers will be managed by the parent component
        // OpenGlobus v0.27 doesn't support entity.events.on() API

        entityCollectionRef.current.add(boundaryEntity);
        entities.push(boundaryEntity);
        console.log(`Created boundary entity for ${props.NAME_2}, has polygon:`, !!boundaryEntity.polygon, 'keys:', Object.keys(boundaryEntity).slice(0, 10));
      }

      return entities;
    } catch (err) {
      console.error(`Error adding district to map:`, err);
      return null;
    }
  }, [onDistrictSelect, showDistricts, showHeatmap]);

  // Load districts from backend
  useEffect(() => {
    if (!globusReady) return;

    const loadDistricts = async () => {
      try {
        setLoading(true);
        const url = `${baseUrl}/gis/districts`;
        console.log(`Fetching districts from: ${url}`);

        const response = await fetch(url);
        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Fetch failed. Status: ${response.status}, Text: ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`Loaded ${data.features?.length || 0} districts`);

        const features = data.features || [];
        setDistricts(features);

        // Clear existing entities
        if (globusRef.current) {
          districtEntities.forEach(entity => {
            try {
              entity.remove();
            } catch (e) {
              console.warn('Error removing entity:', e);
            }
          });
          setDistrictEntities([]);
        }

        // Add visualization layers
        if (globusRef.current && features.length > 0) {
          console.log('Adding visualization layers...');
          const newEntities = [];

          features.forEach((feature) => {
            const entities = addDistrictToMap(feature);
            if (entities) {
              newEntities.push(...entities);
            }
          });

          setDistrictEntities(newEntities);
          console.log('Visualization layers added successfully');
        }

        setError(null);
      } catch (err) {
        console.error('Error loading districts:', err);
        setError(`Failed to load districts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [baseUrl, globusReady, showHeatmap, showDistricts, addDistrictToMap]);



  // Handle district selection highlighting
  useEffect(() => {
    if (!selectedDistrict || !globusRef.current) {
      console.log('Highlighting skipped:', { selectedDistrict, hasGlobus: !!globusRef.current });
      return;
    }

    console.log(`Highlighting district: ${selectedDistrict}`);
    console.log(`Total entities: ${districtEntities.length}`);

    let selectedCoords = null;
    let highlightedCount = 0;

    districtEntities.forEach((entity, index) => {
      const districtName = entity.properties?.districtName;

      // Debug: log entity structure for first entity
      if (index === 0) {
        console.log('Sample entity structure:', {
          name: entity.name,
          hasPolygon: !!entity.polygon,
          hasGeometry: !!entity.geometry,
          hasRenderNode: !!entity._renderNode,
          properties: entity.properties,
          keys: Object.keys(entity)
        });
      }

      if (!entity.polygon) {
        console.warn('Entity missing polygon:', entity.name);
        return;
      }

      if (districtName === selectedDistrict && entity.properties.type === 'boundary') {
        // Highlight selected district
        console.log(`Highlighting boundary for: ${districtName}`);
        try {
          // Update polygon style directly
          if (entity.polygon.style) {
            entity.polygon.style.fillColor = 'rgba(255, 255, 0, 0.6)';
            entity.polygon.style.lineColor = 'rgba(255, 255, 0, 1)';
            entity.polygon.style.lineWidth = 4;
            entity.polygon.refresh();  // Refresh the polygon to apply changes
          }
          highlightedCount++;
        } catch (err) {
          console.error('Error setting polygon style:', err);
        }

        // Store coordinates for camera
        if (entity.lonlat) {
          selectedCoords = entity.lonlat;
        }
      } else if (entity.properties.type === 'boundary') {
        // Reset other districts
        try {
          if (entity.polygon.style) {
            entity.polygon.style.fillColor = 'rgba(0, 255, 0, 0.15)';
            entity.polygon.style.lineColor = 'rgba(0, 255, 0, 0.6)';
            entity.polygon.style.lineWidth = 2;
            entity.polygon.refresh();  // Refresh the polygon to apply changes
          }
        } catch (err) {
          console.error('Error resetting polygon style:', err);
        }
      }
    });

    console.log(`Highlighted ${highlightedCount} districts`);

    // Fly to selected district
    if (selectedCoords && globusRef.current.planet) {
      console.log(`Flying to coordinates:`, selectedCoords);
      try {
        const lonLat = new LonLat(selectedCoords[0], selectedCoords[1], 150000);
        globusRef.current.planet.flyLonLat(lonLat);
      } catch (err) {
        console.error('Error flying to district:', err);
      }
    } else {
      console.warn('No coordinates found for selected district');
    }
  }, [selectedDistrict, districtEntities]);

  return (
    <div className="gis-district-map-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <MapPin size={20} style={{ color: '#1e40af' }} />
          <h3 style={styles.title}>Rwanda Districts Map - 3D Geospatial Analysis</h3>
        </div>
        {loading && <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />}
      </div>

      {/* Layer Controls */}
      <div style={styles.layerControls}>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          style={{
            ...styles.layerButton,
            backgroundColor: showHeatmap ? '#ef4444' : '#6b7280',
          }}
        >
          {showHeatmap ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>Soil Quality Heatmap</span>
        </button>
        <button
          onClick={() => setShowDistricts(!showDistricts)}
          style={{
            ...styles.layerButton,
            backgroundColor: showDistricts ? '#00ff00' : '#6b7280',
          }}
        >
          {showDistricts ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>District Boundaries</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div style={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {/* Map container */}
      <div
        ref={containerRef}
        style={{
          ...styles.mapContainer,
          opacity: loading ? 0.5 : 1,
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
            <p>Loading satellite imagery and terrain...</p>
          </div>
        </div>
      )}

      {/* Info panel */}
      {selectedDistrict && (
        <div style={styles.infoPanel}>
          <p style={styles.infoPanelText}>
            <strong>Selected District:</strong> {selectedDistrict}
          </p>
          <p style={{ ...styles.infoPanelText, fontSize: '12px', marginTop: '8px', color: '#cbd5e1' }}>
            Click on the map to select a different district
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    transition: 'opacity 0.3s ease',
    minHeight: '400px',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: '#64748b',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    borderBottom: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '14px',
  },
  infoPanel: {
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    borderTop: '1px solid #bfdbfe',
    color: '#1e40af',
    fontSize: '14px',
  },
  infoPanelText: {
    margin: 0,
  },
  layerControls: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    zIndex: 5,
  },
  layerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default GisDistrictMap;