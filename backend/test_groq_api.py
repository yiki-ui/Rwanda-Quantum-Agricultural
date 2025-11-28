#!/usr/bin/env python3
"""
Test script to diagnose Groq API issues
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async def test_groq_api():
    """Test Groq API connection and request format"""
    
    print("=" * 60)
    print("GROQ API DIAGNOSTIC TEST")
    print("=" * 60)
    
    # Check 1: API Key
    print("\n✓ Check 1: API Key")
    if not GROQ_API_KEY:
        print("  ❌ GROQ_API_KEY is not set!")
        return False
    
    print(f"  ✅ API Key found (length: {len(GROQ_API_KEY)})")
    print(f"  ✅ API Key starts with: {GROQ_API_KEY[:10]}...")
    
    # Check 2: Headers
    print("\n✓ Check 2: Headers")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    print(f"  ✅ Authorization header: Bearer {GROQ_API_KEY[:10]}...")
    print(f"  ✅ Content-Type: application/json")
    
    # Check 3: Payload
    print("\n✓ Check 3: Payload Format")
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ]
    
    payload = {
        "model": "llama-3.3-70b-versatile",  # Latest Groq model
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024,
        "top_p": 1.0
    }
    
    print(f"  ✅ Model: {payload['model']}")
    print(f"  ✅ Messages: {len(messages)} messages")
    print(f"  ✅ Temperature: {payload['temperature']}")
    print(f"  ✅ Max tokens: {payload['max_tokens']}")
    print(f"  ✅ Top P: {payload['top_p']}")
    
    # Check 4: API Call
    print("\n✓ Check 4: Making API Request")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print(f"  → POST {GROQ_API_URL}")
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            
            print(f"  ← Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("  ✅ SUCCESS! API is working correctly")
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                print(f"  ✅ Response: {content[:100]}...")
                return True
            
            elif response.status_code == 400:
                print("  ❌ 400 Bad Request")
                print(f"  Error details: {response.text}")
                
                # Try to parse error
                try:
                    error_data = response.json()
                    print(f"  Error message: {error_data.get('error', {}).get('message', 'Unknown')}")
                except:
                    pass
                
                return False
            
            elif response.status_code == 401:
                print("  ❌ 401 Unauthorized")
                print("  → Your API key is invalid or expired")
                print("  → Get a new key from https://console.groq.com")
                return False
            
            elif response.status_code == 429:
                print("  ❌ 429 Too Many Requests")
                print("  → You've exceeded the rate limit")
                print("  → Wait a moment and try again")
                return False
            
            else:
                print(f"  ❌ Unexpected status code: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
    
    except httpx.ConnectError as e:
        print(f"  ❌ Connection Error: {e}")
        print("  → Check your internet connection")
        return False
    
    except httpx.TimeoutException as e:
        print(f"  ❌ Timeout Error: {e}")
        print("  → The API took too long to respond")
        return False
    
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

async def main():
    """Run all tests"""
    success = await test_groq_api()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ ALL TESTS PASSED - API is working correctly!")
    else:
        print("❌ TESTS FAILED - See errors above")
    print("=" * 60)
    
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)
