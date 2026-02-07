"""
Test script for the Capital One Career Break Simulator
Run this AFTER starting the Flask server to verify everything works
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Health check passed!")
        return True
    else:
        print("❌ Health check failed!")
        return False


def test_quick_calculation():
    """Test the calculation endpoint (no API required)"""
    print("\n" + "="*60)
    print("TEST 2: Quick Calculation (No Nessie API)")
    print("="*60)
    
    payload = {
        "months": 6,
        "salary": 75000
    }
    
    print(f"Request: {json.dumps(payload, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/calculate-impact",
        json=payload
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Quick calculation passed!")
        return True
    else:
        print("❌ Quick calculation failed!")
        return False


def test_simulation():
    """Test the full Nessie API simulation"""
    print("\n" + "="*60)
    print("TEST 3: Full Nessie API Simulation")
    print("="*60)
    print("⚠️  This requires a valid Nessie API key!")
    print("="*60)
    
    payload = {
        "months": 6
    }
    
    print(f"Request: {json.dumps(payload, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/simulate",
        json=payload
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        print("\n📊 Simulation Results:")
        print(f"  Initial Balance: ${data['simulation']['initial_balance']:,}")
        print(f"  Final Balance: ${data['simulation']['final_balance']:,}")
        print(f"  Total Spent: ${data['simulation']['total_spent']:,}")
        print(f"  Depletion: {data['simulation']['depletion_percentage']}%")
        print(f"  Warning Active: {data['simulation']['warning']}")
        print("✅ Full simulation passed!")
        return True
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("\n❌ Full simulation failed!")
        print("💡 Make sure you've configured your Nessie API key in banking_service.py")
        return False


def test_error_handling():
    """Test that error handling works correctly"""
    print("\n" + "="*60)
    print("TEST 4: Error Handling")
    print("="*60)
    
    # Test invalid months
    payload = {"months": 999}
    print(f"Testing invalid months (999): {json.dumps(payload, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/simulate",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 400:
        print("✅ Error handling works correctly!")
        return True
    else:
        print("❌ Error handling failed!")
        return False


def main():
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║  Capital One Career Break Simulator - Test Suite          ║
    ║  InnovateHer 2026 | Finance Forward Track                 ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    print("⚠️  Make sure the Flask server is running first!")
    print("   Run: python banking_service.py")
    print("\nStarting tests...")
    
    results = []
    
    try:
        results.append(("Health Check", test_health_check()))
        results.append(("Quick Calculation", test_quick_calculation()))
        results.append(("Error Handling", test_error_handling()))
        results.append(("Full Simulation", test_simulation()))
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to Flask server!")
        print("💡 Make sure you've started the server with: python banking_service.py")
        return
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total_passed = sum(1 for _, passed in results if passed)
    print(f"\nTotal: {total_passed}/{len(results)} tests passed")
    
    if total_passed == len(results):
        print("\n🎉 All tests passed! Your backend is ready for the hackathon!")
    elif total_passed >= len(results) - 1:
        print("\n⚠️  Most tests passed. If 'Full Simulation' failed, check your API key.")
    else:
        print("\n❌ Multiple tests failed. Check the errors above.")


if __name__ == "__main__":
    main()
