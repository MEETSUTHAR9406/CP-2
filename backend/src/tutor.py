from transformers import pipeline
from typing import Optional

class SocraticTutor:
    def __init__(self):
        # We will use a lightweight text-generation model for generating hints
        # For a true production app, you might use an API like OpenAI here,
        # but since we are keeping models local based on existing architecture:
        print("Loading SocraticTutor model...")
        try:
            # Using a very small instructional model for demonstration purposes
            self.model = pipeline(
                "text2text-generation", 
                model="google/flan-t5-small", # Using small for speed, use base or large if VRAM permits
                device=-1 # CPU for now; change to 0 if GPU becomes available
            )
            print("SocraticTutor model loaded.")
        except Exception as e:
            print(f"Error loading SocraticTutor model: {e}")
            self.model = None

    def generate_hint(self, question_text: str, wrong_answer_selected: str, correct_answer: str, context: Optional[str] = "") -> str:
        """
        Generates a Socratic hint without giving away the direct answer.
        """
        if not self.model:
            return "Consider reviewing the material related to this concept again."

        # Prompt formatting for FLAN-T5
        prompt = (
            f"You are a helpful tutor. The student was asked: '{question_text}' "
            f"The correct answer is '{correct_answer}', but the student guessed '{wrong_answer_selected}'. "
            f"Based on this context: '{context[:200]}...', provide a very short, one sentence hint or leading "
            f"question that helps them realize why '{wrong_answer_selected}' is wrong, without telling them the answer is '{correct_answer}'."
        )

        try:
            output = self.model(prompt, max_length=60, num_return_sequences=1)
            hint = output[0]['generated_text']
            
            # Formatting cleanup in case the model hallucinates
            if not hint.strip() or len(hint) < 10:
                hint = f"Think about why {wrong_answer_selected} might not fit the context provided."
                
            return hint
        except Exception as e:
            print(f"Error generating hint: {e}")
            return "Re-read the question carefully and think about the core concepts."
