from transformers import pipeline
from typing import List, Dict, Optional
import re

class SlideGenerator:
    def __init__(self, model_name: str = "google/flan-t5-small"):
        print(f"Loading SlideGenerator model: {model_name}...")
        try:
            self.model = pipeline(
                "text2text-generation",
                model=model_name,
                device=-1 # CPU for now
            )
            print("SlideGenerator model loaded.")
        except Exception as e:
            print(f"Error loading SlideGenerator model: {e}")
            self.model = None

    def generate_slide_content(self, chunk: str) -> Dict:
        """
        Generates a structured slide (Title + Bullets) from a text chunk.
        """
        if not self.model:
            return {
                "title": "Topic Overview",
                "content": ["Summary unavailable.", "Please check the source material."]
            }

        # 1. Generate a descriptive title
        title_prompt = f"Summarize the following text into a short, catchy slide title (max 5 words): '{chunk[:1000]}'"
        try:
            title_output = self.model(title_prompt, max_length=15, num_return_sequences=1)
            title = title_output[0]['generated_text'].strip()
            # Basic cleanup
            title = re.sub(r'^Title: ', '', title, flags=re.IGNORECASE)
            if not title or len(title) < 3:
                title = "Concept Overview"
        except:
            title = "Section Summary"

        # 2. Generate bullet points
        bullets_prompt = (
            f"Extract 3 key educational bullet points from this text. "
            f"Format as a list. Text: '{chunk[:1500]}'"
        )
        try:
            bullets_output = self.model(bullets_prompt, max_length=120, num_return_sequences=1)
            raw_bullets = bullets_output[0]['generated_text']
            
            # Split and clean bullets
            # FLAN-T5 sometimes returns them separated by newlines or markers
            points = [p.strip() for p in re.split(r'\n|•|\*', raw_bullets) if len(p.strip()) > 5]
            
            if not points:
                # Fallback: simple split of the whole text if generation failed to format well
                points = [p.strip() + "." for p in raw_bullets.split('.') if len(p.strip()) > 10][:3]
            
            # Limit to 3 bullets max
            points = points[:3]
            
            # Final fallback if points still empty
            if not points:
                points = ["Key concepts extracted from the text.", "See original material for more details."]
                
        except:
            points = ["Unable to extract specific points.", "General summary of the material."]

        return {
            "title": title,
            "content": points
        }

    def generate_presentation(self, chunks: List[str]) -> List[Dict]:
        """
        Generates a full presentation structure from list of text chunks.
        """
        slides = []
        
        # Add a professional intro slide
        slides.append({
            "title": "Welcome to the Presentation",
            "content": [
                "Comprehensive overview of the provided materials.",
                "Structured for clarity and better learning.",
                "AI-Generated Key Insights."
            ]
        })

        for chunk in chunks:
            slide = self.generate_slide_content(chunk)
            slides.append(slide)
            
        return slides
