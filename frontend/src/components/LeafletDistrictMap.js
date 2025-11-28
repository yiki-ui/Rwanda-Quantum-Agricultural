import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader, Layers, Satellite, Map, Mountain, Globe } from 'lucide-react';

// Layer definitions
const LAYER_TYPES = {
    SATELLITE: 'satellite',
    STREET: 'street',
    TERRAIN: 'terrain',
    HYBRID: 'hybrid'
};

const BASE_LAYERS = {
    [LAYER_TYPES.SATELLITE]: {
        name: 'Satellite',
        icon: 'Satellite',
        layers: [
            {
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 19
            }
        ]
    },
    [LAYER_TYPES.STREET]: {
        name: 'Street',
        icon: 'Map',
        layers: [
            {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19
            }
        ]
    },
    [LAYER_TYPES.TERRAIN]: {
        name: 'Terrain',
        icon: 'Mountain',
        layers: [
            {
                url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
                maxZoom: 17
            }
        ]
    },
    [LAYER_TYPES.HYBRID]: {
        name: 'Hybrid',
        icon: 'Globe',
        layers: [
            {
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 19
            },
            {
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
                attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 19
            }
        ]
    }
};

// Layer Switcher Component
const LayerSwitcher = ({ currentLayer, onLayerChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'rgba(26, 26, 46, 0.95)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(0, 255, 0, 0.3)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00ff00',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}
                title="Switch map layer"
            >
                <Layers size={20} />
                <span>{BASE_LAYERS[currentLayer].name}</span>
            </button>

            {isOpen && (
                <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(0, 255, 0, 0.2)'
                }}>
                    {Object.entries(BASE_LAYERS).map(([key, layer]) => (
                        <button
                            key={key}
                            onClick={() => {
                                onLayerChange(key);
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                background: currentLayer === key ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                                border: 'none',
                                color: currentLayer === key ? '#00ff00' : '#888',
                                cursor: 'pointer',
                                fontSize: '14px',
                                borderRadius: '4px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (currentLayer !== key) {
                                    e.target.style.background = 'rgba(0, 255, 0, 0.1)';
                                    e.target.style.color = '#00ff00';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentLayer !== key) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#888';
                                }
                            }}
                        >
                            {layer.icon === 'Satellite' && <Satellite size={16} />}
                            {layer.icon === 'Map' && <Map size={16} />}
                            {layer.icon === 'Mountain' && <Mountain size={16} />}
                            {layer.icon === 'Globe' && <Globe size={16} />}
                            <span>{layer.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Component to handle map zoom and view updates
const MapController = ({ selectedDistrict, districtBounds }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedDistrict && districtBounds) {
            // Fly to the selected district bounds
            map.flyToBounds(districtBounds, {
                padding: [50, 50],
                duration: 1.5
            });
        }
    }, [selectedDistrict, districtBounds, map]);

    return null;
};

const LeafletDistrictMap = ({ selectedDistrict, onDistrictSelect, apiBaseUrl }) => {
    const [districts, setDistricts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [districtBounds, setDistrictBounds] = useState(null);
    const [currentLayer, setCurrentLayer] = useState(LAYER_TYPES.SATELLITE);
    const geoJsonLayerRef = useRef(null);

    const baseUrl = apiBaseUrl || 'http://localhost:8000';

    // Load districts from backend
    useEffect(() => {
        const loadDistricts = async () => {
            try {
                setLoading(true);
                const url = `${baseUrl}/gis/districts`;
                console.log(`Fetching districts from: ${url}`);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log(`Loaded ${data.features?.length || 0} districts`);
                setDistricts(data);
                setError(null);
            } catch (err) {
                console.error('Error loading districts:', err);
                setError(`Failed to load districts: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadDistricts();
    }, [baseUrl]);

    // Style function for districts
    const getDistrictStyle = (feature) => {
        const districtName = feature.properties?.NAME_2;
        const isSelected = districtName === selectedDistrict;

        return {
            fillColor: isSelected ? '#FFFF00' : '#00FF00',
            fillOpacity: isSelected ? 0.6 : 0.15,
            color: isSelected ? '#FFFF00' : '#00FF00',
            weight: isSelected ? 4 : 2,
            opacity: isSelected ? 1 : 0.6
        };
    };

    // Handle feature click
    const onEachFeature = (feature, layer) => {
        const districtName = feature.properties?.NAME_2;

        layer.on({
            click: () => {
                console.log(`District clicked: ${districtName}`);
                if (districtName && onDistrictSelect) {
                    onDistrictSelect(districtName);

                    // Set bounds for zoom
                    const bounds = layer.getBounds();
                    setDistrictBounds(bounds);
                }
            },
            mouseover: (e) => {
                const layer = e.target;
                if (districtName !== selectedDistrict) {
                    layer.setStyle({
                        fillOpacity: 0.3,
                        weight: 3
                    });
                }
            },
            mouseout: (e) => {
                if (geoJsonLayerRef.current) {
                    geoJsonLayerRef.current.resetStyle(e.target);
                }
            }
        });

        // Add tooltip
        if (districtName) {
            layer.bindTooltip(districtName, {
                permanent: false,
                direction: 'center',
                className: 'district-tooltip'
            });
        }
    };

    // Update district bounds when selection changes
    useEffect(() => {
        if (selectedDistrict && geoJsonLayerRef.current && districts) {
            // Find the selected district feature
            const selectedFeature = districts.features.find(
                f => f.properties?.NAME_2 === selectedDistrict
            );

            if (selectedFeature) {
                // Calculate bounds from coordinates
                const coords = selectedFeature.geometry.coordinates;
                let allCoords = [];

                if (selectedFeature.geometry.type === 'Polygon') {
                    allCoords = coords[0];
                } else if (selectedFeature.geometry.type === 'MultiPolygon') {
                    allCoords = coords[0][0];
                }

                if (allCoords.length > 0) {
                    const bounds = L.latLngBounds(
                        allCoords.map(coord => [coord[1], coord[0]])
                    );
                    setDistrictBounds(bounds);
                }
            }
        }
    }, [selectedDistrict, districts]);

    if (loading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a1a2e'
            }}>
                <Loader className="animate-spin" size={32} color="#00ff00" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a1a2e',
                color: '#ff4444',
                padding: '20px',
                textAlign: 'center'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer
                center={[-1.9403, 29.8739]} // Rwanda center
                zoom={9}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                {/* Render base layers based on current selection */}
                {BASE_LAYERS[currentLayer].layers.map((layer, index) => (
                    <TileLayer
                        key={`${currentLayer}-${index}`}
                        url={layer.url}
                        attribution={layer.attribution}
                        maxZoom={layer.maxZoom}
                    />
                ))}

                {/* District boundaries */}
                {districts && (
                    <GeoJSON
                        ref={geoJsonLayerRef}
                        data={districts}
                        style={getDistrictStyle}
                        onEachFeature={onEachFeature}
                    />
                )}

                {/* Map controller for zoom */}
                <MapController
                    selectedDistrict={selectedDistrict}
                    districtBounds={districtBounds}
                />
            </MapContainer>

            {/* Layer Switcher */}
            <LayerSwitcher
                currentLayer={currentLayer}
                onLayerChange={setCurrentLayer}
            />
        </div>
    );
};

export default LeafletDistrictMap;

