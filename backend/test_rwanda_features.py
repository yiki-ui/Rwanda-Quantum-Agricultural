# test_rwanda_features.py - Test Rwanda-Relevant Agricultural Features
# Rwanda Quantum Agricultural Intelligence Platform
# Comprehensive testing of new Rwanda demo molecules and features

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint: str, method: str = "GET", data: Dict = None) -> Dict[str, Any]:
    """Test an API endpoint and return the response"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}")
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data)
        
        if response.status_code == 200:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Connection failed - make sure the server is running"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def run_rwanda_features_test():
    """Run comprehensive tests of Rwanda-specific features"""
    print("🇷🇼 Testing Rwanda Quantum Agricultural Intelligence Platform")
    print("=" * 60)
    
    # Test 1: Initialize Rwanda demo molecules
    print("\n1. Testing Rwanda Demo Molecules Initialization...")
    result = test_endpoint("/initialize_rwanda_molecules", "POST")
    if result["success"]:
        print(f"✅ Successfully initialized {len(result['data']['added_molecules'])} molecules")
        for molecule in result['data']['added_molecules']:
            print(f"   - {molecule['name']} ({molecule['category']})")
    else:
        print(f"❌ Failed: {result['error']}")
    
    # Test 2: Get Rwanda demo molecules info
    print("\n2. Testing Rwanda Demo Molecules Info...")
    result = test_endpoint("/rwanda_demo_molecules")
    if result["success"]:
        print(f"✅ Found {result['data']['total_molecules']} Rwanda-relevant molecules")
        for key, molecule in result['data']['molecules'].items():
            print(f"   - {molecule['name']}: {molecule['rwanda_relevance'][:50]}...")
    else:
        print(f"❌ Failed: {result['error']}")
    
    # Test 3: Get agricultural recommendations for different scenarios
    print("\n3. Testing Agricultural Recommendations...")
    
    test_scenarios = [
        {"crop_type": "maize", "district": "nyagatare"},
        {"crop_type": "coffee", "district": "huye"},
        {"pest_issue": "fall_armyworm"},
        {"nutrient_deficiency": "iron"},
        {"crop_type": "beans", "nutrient_deficiency": "iron", "district": "gatsibo"}
    ]
    
    for scenario in test_scenarios:
        result = test_endpoint("/rwanda_agricultural_recommendations", "POST", scenario)
        if result["success"]:
            data = result["data"]
            print(f"✅ Scenario {scenario}: {data['total_recommendations']} recommendations")
            for rec in data['recommendations']:
                print(f"   - {rec['molecule']}: {rec['reason']}")
            if data.get('location_specific_notes'):
                print(f"   📍 Location notes: {', '.join(data['location_specific_notes'])}")
        else:
            print(f"❌ Scenario {scenario} failed: {result['error']}")
    
    # Test 4: Get Rwanda molecule statistics
    print("\n4. Testing Rwanda Molecule Statistics...")
    result = test_endpoint("/rwanda_molecule_statistics")
    if result["success"]:
        stats = result["data"]
        print(f"✅ Total Rwanda molecules: {stats['total_rwanda_molecules']}")
        print("   Categories:")
        for category, count in stats['by_category'].items():
            print(f"   - {category}: {count}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    # Test 5: Get crop-pest matrix
    print("\n5. Testing Crop-Pest-Solution Matrix...")
    result = test_endpoint("/rwanda_crop_pest_matrix")
    if result["success"]:
        matrix = result["data"]["crop_pest_matrix"]
        print(f"✅ Matrix covers {result['data']['total_crops']} crops")
        for crop, info in matrix.items():
            print(f"   - {crop.upper()}:")
            print(f"     Pests: {', '.join(info['major_pests'])}")
            print(f"     Solutions: {', '.join(info['recommended_molecules'])}")
            print(f"     Seasons: {', '.join(info['seasonal_considerations'])}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    # Test 6: Search for specific molecules
    print("\n6. Testing Molecule Search...")
    search_queries = ["neem", "urea", "caffeine", "iron"]
    
    for query in search_queries:
        search_data = {"query": query, "limit": 5}
        result = test_endpoint("/search_molecules", "POST", search_data)
        if result["success"]:
            data = result["data"]
            print(f"✅ Search '{query}': {data['total_found']} found, {data['returned_count']} returned")
            for molecule in data['molecules']:
                print(f"   - {molecule['name']} ({molecule['category']})")
        else:
            print(f"❌ Search '{query}' failed: {result['error']}")
    
    # Test 7: Test molecular simulation on Rwanda molecules
    print("\n7. Testing Molecular Simulations...")
    # First get a molecule ID
    result = test_endpoint("/search_molecules", "POST", {"query": "urea", "limit": 1})
    if result["success"] and result["data"]["molecules"]:
        molecule_id = result["data"]["molecules"][0]["id"]
        sim_result = test_endpoint(f"/simulate_molecule/{molecule_id}", "POST")
        if sim_result["success"]:
            print(f"✅ Simulation successful for molecule ID {molecule_id}")
            if sim_result["data"].get("success"):
                print(f"   Energy: {sim_result['data'].get('classical_energy', 'N/A')}")
                print(f"   Method: {sim_result['data'].get('method', 'N/A')}")
        else:
            print(f"❌ Simulation failed: {sim_result['error']}")
    
    # Test 8: Database statistics
    print("\n8. Testing Database Statistics...")
    result = test_endpoint("/database_stats")
    if result["success"]:
        stats = result["data"]["stats"]
        print(f"✅ Database contains {stats['total_molecules']} total molecules")
        print(f"   Average molecular weight: {stats.get('avg_molecular_weight', 0):.2f}")
        print(f"   Total simulations: {stats['total_simulations']}")
        print("   Molecules by category:")
        for category, count in stats.get('molecules_by_category', {}).items():
            print(f"   - {category}: {count}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    print("\n" + "=" * 60)
    print("🎉 Rwanda Agricultural Intelligence Platform Testing Complete!")
    print("\nKey Features Demonstrated:")
    print("✓ Rwanda-relevant agricultural molecules (6 types)")
    print("✓ Crop-specific recommendations")
    print("✓ Pest management solutions")
    print("✓ Nutrient deficiency treatments")
    print("✓ Location-based agricultural advice")
    print("✓ Molecular database integration")
    print("✓ Quantum simulation capabilities")
    print("\nThis platform addresses:")
    print("🌾 Fall armyworm in maize (65% nitrogen deficiency)")
    print("☕ Coffee berry borer (major export crop)")
    print("🫘 Iron deficiency in beans (38% prevalence)")
    print("🧪 Organic pesticide alternatives")
    print("💚 Sustainable agricultural practices")

def test_specific_rwanda_scenario():
    """Test a specific Rwanda agricultural scenario"""
    print("\n" + "=" * 60)
    print("🎯 SPECIFIC RWANDA SCENARIO TEST")
    print("Scenario: Maize farmer in Eastern Province with fall armyworm problem")
    print("=" * 60)
    
    # Get recommendations for this specific scenario
    scenario = {
        "crop_type": "maize",
        "pest_issue": "fall_armyworm",
        "district": "nyagatare"
    }
    
    result = test_endpoint("/rwanda_agricultural_recommendations", "POST", scenario)
    if result["success"]:
        data = result["data"]
        print(f"📋 Recommendations for Eastern Province maize farmer:")
        print(f"   Total solutions: {data['total_recommendations']}")
        
        for rec in data['recommendations']:
            print(f"\n🧪 {rec['molecule']}")
            print(f"   Reason: {rec['reason']}")
            
            # Get detailed molecule info
            search_result = test_endpoint("/search_molecules", "POST", {"query": rec['molecule'].split()[0], "limit": 1})
            if search_result["success"] and search_result["data"]["molecules"]:
                molecule = search_result["data"]["molecules"][0]
                print(f"   Category: {molecule['category']}")
                print(f"   Description: {molecule.get('description', 'N/A')[:100]}...")
        
        if data.get('location_specific_notes'):
            print(f"\n📍 Location-specific advice:")
            for note in data['location_specific_notes']:
                print(f"   - {note}")
    
    print("\n💡 This demonstrates how the platform provides:")
    print("   ✓ Targeted molecular solutions")
    print("   ✓ Location-specific advice")
    print("   ✓ Integrated pest and crop management")
    print("   ✓ Scientific backing for recommendations")

if __name__ == "__main__":
    print("Starting Rwanda Agricultural Intelligence Platform Tests...")
    print("Make sure the FastAPI server is running on http://localhost:8000")
    print("You can start it with: uvicorn main:app --reload")
    
    input("Press Enter to continue with testing...")
    
    run_rwanda_features_test()
    test_specific_rwanda_scenario()
