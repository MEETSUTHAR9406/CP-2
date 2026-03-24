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

    def generate_explanation(self, question_text: str, correct_answer: str, context: Optional[str] = "") -> str:
        """
        Generates a direct explanation of the correct answer based on context.
        """
        if not self.model:
            return f"The correct answer is {correct_answer}."

        prompt = (
            f"Question: '{question_text}' "
            f"Correct Answer: '{correct_answer}'. "
            f"Based on this context: '{context[:200]}...', briefly explain why '{correct_answer}' is the right answer."
        )

        try:
            output = self.model(prompt, max_length=60, num_return_sequences=1)
            explanation = output[0]['generated_text']
            
            if not explanation.strip() or len(explanation) < 10:
                return f"Based on the context, {correct_answer} is the correct classification."
                
            return explanation
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return f"{correct_answer} is the best fit according to the provided text."

    def generate_etymology(self, word: str) -> str:
        """
        Generates an etymology/history blurb for a word using the model.
        """
        if not self.model:
            return "Etymology data unavailable."
        
        prompt = f"What is the etymology and historical origin of the english word '{word}'? Give a brief explanation."
        try:
            output = self.model(prompt, max_length=60, num_return_sequences=1)
            result = output[0]['generated_text']
            if len(result) < 10 or result.lower() == word.lower():
                return f"The word '{word}' has deep historical linguistic roots."
            return result
        except Exception as e:
            print(f"Error generating etymology: {e}")
            return "Origin traces back to historical roots."

    def generate_usage_note(self, word: str) -> str:
        """
        Generates a usage note or common misuse warning for a word.
        """
        if not self.model:
            return ""
            
        prompt = f"What is a common grammatical mistake or usage warning for the word '{word}'? Briefly explain."
        try:
            output = self.model(prompt, max_length=50, num_return_sequences=1)
            result = output[0]['generated_text']
            if len(result) < 10 or result.lower() == word.lower():
                return ""
            return result
        except Exception as e:
            print(f"Error generating usage note: {e}")
            return ""
