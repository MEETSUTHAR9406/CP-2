import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import nltk

# Ensure nltk resources are downloaded (handled gracefully)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class QuestionGenerator:
    def __init__(self, model_name="valhalla/t5-base-qg-hl"):
        """
        Initializes the T5 model for Question Generation.
        """
        print(f"Loading model: {model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        print(f"Model loaded on {self.device}.")

    def generate(self, text_context: str, num_questions: int = 5) -> list[str]:
        """
        Generates open-ended questions generally from the text.
        """
        # End-to-end mode
        input_text = "generate questions: " + text_context
        return self._run_model(input_text, num_questions)

    def generate_for_answer(self, answer: str, text_context: str) -> str:
        """
        Generates a single question where 'answer' is the correct answer.
        """
        # Answer-aware mode
        input_text = f"answer: {answer} context: {text_context}"
        questions = self._run_model(input_text, num_questions=1)
        return questions[0] if questions else "What is related to " + answer + "?"

    def _run_model(self, input_text: str, num_questions: int) -> list[str]:
        inputs = self.tokenizer.encode(
            input_text, 
            return_tensors="pt", 
            max_length=512, 
            truncation=True
        ).to(self.device)

        beam_count = max(5, num_questions)
        outputs = self.model.generate(
            inputs,
            max_length=64,
            num_beams=beam_count,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            num_return_sequences=num_questions
        )

        questions = []
        for output in outputs:
            question = self.tokenizer.decode(output, skip_special_tokens=True)
            if question not in questions:
                questions.append(question)
        return questions


# Helper function to split long text into processed chunks
def chunk_text(text: str, max_tokens: int = 400) -> list[str]:
    # Simple chunking by approximate words/sentences would be better, 
    # but for now, we'll rely on sliding windows or simple paragraph splits 
    # to avoid cutting sentences in half too badly.
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        if len(current_chunk) + len(para) < max_tokens * 4: # Approximation: 1 token ~ 4 chars
            current_chunk += para + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para + "\n\n"
            
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks
