import requests
import os

url = "http://localhost:8000/api/generate"
file_path = "test_book.txt"

# Ensure file exists
if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

print(f"Testing API at {url} with file {file_path}...")

files = {'file': open(file_path, 'rb')}
data = {'num_questions': 2, 'mode': 'mcq'}

try:
    response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        print("\n[SUCCESS] API responded with 200 OK.")
        json_resp = response.json()
        results = json_resp.get("results", [])
        print(f"Received {len(results)} questions.")
        
        for i, item in enumerate(results[:2]):
            print(f"\n--- Question {i+1} ---")
            print(f"Type: {item['type']}")
            print(f"Q: {item['question']}")
            if item['type'] == 'mcq':
                print("Options:", item['options'])
                print("Answer:", item['answer'])
    else:
        print(f"\n[FAILED] Status Code: {response.status_code}")
        print("Response:", response.text)

except Exception as e:
    print(f"\n[ERROR] Error occurred: {e}")
