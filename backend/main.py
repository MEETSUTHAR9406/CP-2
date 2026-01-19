import argparse
import sys
from src.data_source import FileDataSource
from src.generator import QuestionGenerator, chunk_text
from src.mcq_engine import MCQEngine
from difflib import SequenceMatcher
import random

def main():
    parser = argparse.ArgumentParser(description="AI Question Generator from Book")
    parser.add_argument("input_file", help="Path to the book/text file")
    parser.add_argument("--num_questions", type=int, default=5, help="Number of questions to generate per chunk")
    parser.add_argument("--mode", choices=['qa', 'mcq'], default='mcq', help="Generation mode: 'qa' for open ended, 'mcq' for multiple choice")
    
    args = parser.parse_args()
    
    # 1. Load Data
    print(f"Reading file: {args.input_file}")
    try:
        source = FileDataSource(args.input_file)
        full_text = source.get_text()
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
        
    if not full_text.strip():
        print("Error: File is empty.")
        sys.exit(1)

    print(f"Successfully read {len(full_text)} characters.")
    
    # 2. Process Text
    chunks = chunk_text(full_text)
    print(f"Split text into {len(chunks)} chunks for processing.")
    
    # 3. Initialize Model
    try:
        generator = QuestionGenerator()
        mcq_engine = MCQEngine()
    except Exception as e:
        print(f"Error loading model: {e}")
        sys.exit(1)
        
    # 4. Generate Questions
    print("\nStarting Question Generation...\n")
    
    # meaningful limit for demo purposes (first 3 chunks)
    for i, chunk in enumerate(chunks[:3]): 
        print(f"--- Processing Chunk {i+1}/{min(len(chunks), 3)} ---")
        
        if args.mode == 'qa':
            questions = generator.generate(chunk, num_questions=args.num_questions)
            for q in questions:
                print(f"- {q}")
        elif args.mode == 'mcq':
            # 1. Get Answers
            answers = mcq_engine.get_candidate_answers(chunk, num_candidates=args.num_questions * 3) # Get more candidates to filter
            seen_questions = []
            for ans in answers:
                if len(seen_questions) >= args.num_questions:
                    break
                # 2. Generate Question for Answer
                question = generator.generate_for_answer(ans, chunk)
                
                # Deduplication check
                is_duplicate = False
                for existing_q in seen_questions:
                    similarity = SequenceMatcher(None, question, existing_q).ratio()
                    if similarity > 0.85: # Threshold for similarity
                        is_duplicate = True
                        break
                
                if is_duplicate:
                    continue
                    
                seen_questions.append(question)
                
                # 3. Get Distractors
                distractors = mcq_engine.get_distractors(ans, chunk)
                options = distractors + [ans]
                random.shuffle(options)
                
                # Display
                print(f"\nQ: {question}")
                for idx, opt in enumerate(options):
                    prefix = "A" if idx == 0 else ("B" if idx == 1 else ("C" if idx == 2 else "D"))
                    print(f"   {prefix}) {opt}")
                print(f"   (Correct: {ans})")
            
    print("\nDone! Generated valid questions based on the text.")

if __name__ == "__main__":
    main()
