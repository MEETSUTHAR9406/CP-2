import requests
import os

BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing API endpoints...")
    try:
        # 1. Test Generate Questions (Original)
        print("\n=== Testing POST /api/generate ===")
        file_path = "test_book.txt"
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write("React is a library for building user interfaces. It uses a virtual DOM.")
        
        files = {'file': open(file_path, 'rb')}
        data = {'num_questions': 2, 'mode': 'mcq'}
        
        gen_resp = requests.post(f"{BASE_URL}/api/generate", files=files, data=data)
        if gen_resp.status_code == 200:
            print("[SUCCESS] Successfully generated questions:")
            results = gen_resp.json().get("results", [])
            print(f"   Received {len(results)} questions")
        else:
            print(f"[FAILED] Failed: {gen_resp.status_code}")

        # 2. Test GET Questions
        print("\n=== Testing GET /api/questions ===")
        get_q_resp = requests.get(f"{BASE_URL}/api/questions?type=mcq")
        if get_q_resp.status_code == 200:
            print("[SUCCESS] Successfully fetched questions:")
            questions = get_q_resp.json()
            print(f"   Found {len(questions)} questions in DB")
        else:
            print(f"[FAILED] Failed: {get_q_resp.status_code} - {get_q_resp.text}")

        # 2.1 Test Generate QA Questions (For Flashcards)
        print("\n=== Testing POST /api/generate (QA Mode) ===")
        data_qa = {'num_questions': 3, 'mode': 'qa'}
        # Use existing files from previous test
        files_qa = {'file': ('test_book.txt', open('test_book.txt', 'rb'))}
        gen_qa_resp = requests.post(f"{BASE_URL}/api/generate", files=files_qa, data=data_qa)
        if gen_qa_resp.status_code == 200:
            print("[SUCCESS] Successfully generated QA flashcards:")
            qa_results = gen_qa_resp.json().get("results", [])
            for item in qa_results:
                print(f"   Q: {item.get('text')} | A: {item.get('answer')}")
        else:
            print(f"[FAILED] Failed: {gen_qa_resp.status_code}")

        # 3. Test POST Exam
        print("\n=== Testing POST /api/exams ===")
        exam_data = {
            "title": "React Knowledge Test",
            "description": "Auto-generated test exam",
            "duration": 30,
            "created_by": "test_script",
            "questions": questions[:2] if 'questions' in locals() and len(questions) > 0 else []
        }
        post_exam_resp = requests.post(f"{BASE_URL}/api/exams", json=exam_data)
        if post_exam_resp.status_code == 200:
            print("[SUCCESS] Successfully created exam:")
            print(f"   Exam ID: {post_exam_resp.json().get('id', 'Unknown')}")
        else:
            print(f"[FAILED] Failed: {post_exam_resp.status_code} - {post_exam_resp.text}")

        # 4. Test GET Exams
        print("\n=== Testing GET /api/exams ===")
        get_exam_resp = requests.get(f"{BASE_URL}/api/exams")
        if get_exam_resp.status_code == 200:
            print("[SUCCESS] Successfully fetched exams:")
            print(f"   Found {len(get_exam_resp.json())} exams in DB")
        else:
            print(f"[FAILED] Failed: {get_exam_resp.status_code} - {get_exam_resp.text}")
            
        # 5. Test Generate Slides
        print("\n=== Testing POST /api/slides/generate ===")
        files_slide = {'file': open(file_path, 'rb')}
        slide_resp = requests.post(f"{BASE_URL}/api/slides/generate", files=files_slide)
        if slide_resp.status_code == 200:
            print("[SUCCESS] Successfully generated slides:")
            slides = slide_resp.json().get("slides", [])
            print(f"   Generated {len(slides)} slides")
        else:
            print(f"[FAILED] Failed: {slide_resp.status_code} - {slide_resp.text}")

        # 6. Test Knowledge Map
        print("\n=== Testing GET /api/knowledge-map ===")
        map_resp = requests.get(f"{BASE_URL}/api/knowledge-map")
        if map_resp.status_code == 200:
            map_data = map_resp.json()
            print(f"[SUCCESS] Successfully fetched knowledge map:")
            print(f"   Nodes: {len(map_data.get('nodes', []))}, Links: {len(map_data.get('links', []))}")
        else:
            print(f"[FAILED] Failed: {map_resp.status_code}")

        # 7. Test Socratic Tutor
        print("\n=== Testing POST /api/tutor/hint ===")
        hint_payload = {
            "question_text": "What is the capital of France?",
            "wrong_answer": "Berlin",
            "correct_answer": "Paris",
            "context": "Paris is the capital of France."
        }
        tutor_resp = requests.post(f"{BASE_URL}/api/tutor/hint", json=hint_payload)
        if tutor_resp.status_code == 200:
            print("[SUCCESS] Successfully received Tutor Hint:")
            print(f"   Hint: {tutor_resp.json().get('hint')}")
        else:
            print(f"[FAILED] Failed: {tutor_resp.status_code}")

        # 8. Test YouTube Summarization
        print("\n=== Testing POST /api/summarize (YouTube) ===")
        yt_payload = {"youtube_url": "https://www.youtube.com/watch?v=6hR-Z3uE_L4"}
        yt_resp = requests.post(f"{BASE_URL}/api/summarize", data=yt_payload)
        if yt_resp.status_code == 200:
            print("[SUCCESS] Successfully summarized YouTube Video:")
            print(f"   Summary length: {len(yt_resp.json().get('summary', ''))} chars")
        else:
            print(f"[FAILED] Failed: {yt_resp.status_code} - {yt_resp.text}")

    except Exception as e:
        print(f"\n[ERROR] Error occurred: {e}")

if __name__ == "__main__":
    test_api()
