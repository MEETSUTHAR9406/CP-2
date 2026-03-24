import sys
import os
# Add backend to path to import src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.slide_generator import SlideGenerator

def test_generation():
    print("Testing SlideGenerator...")
    gen = SlideGenerator()
    if not gen.model:
        print("Model not loaded, skipping test.")
        return

    test_chunk = "React is a JavaScript library for building user interfaces. It is maintained by Meta and a community of individual developers and companies. React can be used as a base in the development of single-page or mobile applications."
    
    result = gen.generate_slide_content(test_chunk)
    print(f"Title: {result['title']}")
    print(f"Bullets: {result['content']}")
    
    assert 'title' in result
    assert 'content' in result
    assert isinstance(result['content'], list)
    assert len(result['content']) > 0
    
    print("Test passed!")

if __name__ == "__main__":
    try:
        test_generation()
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)
