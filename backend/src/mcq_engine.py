import nltk
import random
from collections import Counter

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

class MCQEngine:
    def __init__(self):
        pass

    def get_candidate_answers(self, text: str, num_candidates: int = 5) -> list[str]:
        """
        Extracts nouns/noun phrases from text to serve as answers.
        Returns a list of unique strings.
        """
        sentences = nltk.sent_tokenize(text)
        candidates = []
        
        for sent in sentences:
            words = nltk.word_tokenize(sent)
            tags = nltk.pos_tag(words)
            
            # Simple heuristic: filter for Nouns (NN, NNS, NNP, NNPS)
            # Avoid single character words or very common stop words (basic filter)
            nouns = [word for word, pos in tags if pos.startswith('NN') and len(word) > 2]
            candidates.extend(nouns)
            
        # Prioritize frequent nouns as they are likely key subjects
        # But for variety, we might want random selection
        # Let's count them to ensure they are "important" enough, but return unique list
        counts = Counter(candidates)
        
        # Filter candidates that appear at least once (trivial) but maybe sort by frequency?
        # unique_candidates = sorted(counts.keys(), key=lambda x: counts[x], reverse=True)
        unique_candidates = list(set(candidates))
        
        # Randomly select to ensure variety if we have many
        if len(unique_candidates) > num_candidates:
            return random.sample(unique_candidates, num_candidates)
        return unique_candidates

    def get_distractors(self, answer: str, context_text: str, num_distractors: int = 3) -> list[str]:
        """
        Generates wrong answers.
        Strategy: Pick other nouns from the same text that are NOT the answer.
        This provides contextually relevant but incorrect options.
        """
        all_nouns = self.get_candidate_answers(context_text, num_candidates=50)
        
        # Filter out the correct answer and similar strings
        options = [n for n in all_nouns if n.lower() != answer.lower() and answer.lower() not in n.lower()]
        
        if len(options) < num_distractors:
            # Fallback if text is too short: return placeholders or repeats (shouldn't happen on book text)
            return options + ["None of the above"] * (num_distractors - len(options))
            
        return random.sample(options, num_distractors)
