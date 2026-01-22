import requests
import time

def test_api():
    url = "http://localhost:8000/generate"
    
    # Create a dummy text file
    with open("test_upload.txt", "w") as f:
        f.write("Artificial Intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction. Particular applications of AI include expert systems, speech recognition and machine vision.")
        
    files = {'file': open("test_upload.txt", "rb")}
    data = {
        'difficulty': 'medium',
        'count': 2,
        'mcq': 'true',
        'short': 'true'
    }
    
    print("Sending request...")
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    # retrying a few times
    for i in range(5):
        try:
            test_api()
            break
        except:
            print("Retrying...")
            time.sleep(5)
