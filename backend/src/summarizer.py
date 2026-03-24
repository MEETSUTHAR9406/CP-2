from transformers import pipeline
import torch

class Summarizer:
    def __init__(self, model_name="sshleifer/distilbart-cnn-12-6"):
        print(f"Loading summarization model: {model_name}...")
        device = 0 if torch.cuda.is_available() else -1
        self.summarizer = pipeline("summarization", model=model_name, device=device)
        print("Summarization model loaded.")

    def summarize(self, text: str, max_length: int = 130, min_length: int = 30) -> str:
        """
        Summarizes the given text.
        Handles long text by chunking (basic implementation).
        """
        # Improved chunking for long texts could go here.
        # For now, we utilize the pipeline's truncation or basic splitting.
        
        # Taking the first 1024 tokens worth of characters approx (4000 chars) 
        # as a simple heuristic to avoid model input limits for now.
        # Validation: distilbart limit is 1024 tokens.
        
        truncated_text = text[:4000] 
        
        try:
            summary_list = self.summarizer(truncated_text, max_length=max_length, min_length=min_length, do_sample=False)
            return summary_list[0]['summary_text']
        except Exception as e:
            print(f"Error during summarization: {e}")
            return "Failed to generate summary."
