#!/usr/bin/env python3
"""
Generate rwanda_districts.geojson from rwanda_sectors.geojson
by aggregating sectors into districts using the NAME_2 property.

This version uses pure JSON manipulation without external dependencies.
"""

import json
import os

def calculate_bounds(coordinates):
    """Calculate bounding box from polygon coordinates."""
    lons = [c[0] for c in coordinates]
    lats = [c[1] for c in coordinates]
    return {
        "minLon": min(lons),
        "maxLon": max(lons),
        "minLat": min(lats),
        "maxLat": max(lats)
    }

def calculate_centroid(coordinates):
    """Calculate centroid from polygon coordinates."""
    lons = [c[0] for c in coordinates]
    lats = [c[1] for c in coordinates]
    return {
        "lon": (min(lons) + max(lons)) / 2,
        "lat": (min(lats) + max(lats)) / 2
    }

def generate_districts_geojson():
    """
    Read sectors GeoJSON and aggregate by district (NAME_2).
    Creates MultiPolygon features for each district.
    """
    
    # Path to input and output files
    input_file = os.path.join(os.path.dirname(__file__), "processed_gis", "rwanda_sectors.geojson")
    output_file = os.path.join(os.path.dirname(__file__), "processed_gis", "rwanda_districts.geojson")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return False
    
    print(f"Reading sectors from {input_file}...")
    
    # Load sectors GeoJSON
    with open(input_file, 'r', encoding='utf-8') as f:
        sectors_data = json.load(f)
    
    # Group sectors by district (NAME_2)
    districts = {}
    
    for feature in sectors_data.get("features", []):
        props = feature.get("properties", {})
        district_name = props.get("NAME_2", "Unknown")
        
        if district_name not in districts:
            districts[district_name] = {
                "properties": {
                    "NAME_0": props.get("NAME_0"),
                    "ISO": props.get("ISO"),
                    "ID_0": props.get("ID_0"),
                    "NAME_1": props.get("NAME_1"),
                    "ID_1": props.get("ID_1"),
                    "NAME_2": district_name,
                    "ID_2": props.get("ID_2"),
                    "TYPE_2": "District",
                    "ENGTYPE_2": "District",
                },
                "polygons": []
            }
        
        # Add polygon coordinates to district
        if feature.get("geometry", {}).get("type") == "Polygon":
            coords = feature["geometry"].get("coordinates", [])
            if coords:
                districts[district_name]["polygons"].append(coords)
    
    print(f"Found {len(districts)} districts")
    
    # Create district features as MultiPolygons
    district_features = []
    
    for district_name, data in sorted(districts.items()):
        try:
            # Create MultiPolygon from all sector polygons
            coordinates = data["polygons"]
            
            if not coordinates:
                print(f"✗ No polygons for {district_name}")
                continue
            
            # Create MultiPolygon geometry
            geojson_geom = {
                "type": "MultiPolygon",
                "coordinates": coordinates
            }
            
            # Calculate bounds and centroid from first polygon
            first_polygon = coordinates[0][0] if coordinates[0] else []
            if first_polygon:
                data["properties"]["bbox"] = calculate_bounds(first_polygon)
                data["properties"]["centroid"] = calculate_centroid(first_polygon)
            
            # Create feature
            feature = {
                "type": "Feature",
                "properties": data["properties"],
                "geometry": geojson_geom
            }
            
            district_features.append(feature)
            print(f"✓ Created district: {district_name} ({len(coordinates)} sectors)")
            
        except Exception as e:
            print(f"✗ Error processing {district_name}: {str(e)}")
            continue
    
    # Create FeatureCollection
    districts_geojson = {
        "type": "FeatureCollection",
        "features": district_features
    }
    
    # Write output file
    print(f"\nWriting districts to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(districts_geojson, f, indent=2)
    
    print(f"✓ Successfully created {output_file}")
    print(f"  Total districts: {len(district_features)}")
    
    return True

if __name__ == "__main__":
    success = generate_districts_geojson()
    exit(0 if success else 1)
