from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.data_source import FileDataSource
from src.generator import QuestionGenerator, chunk_text
from src.mcq_engine import MCQEngine
import shutil
import os
import tempfile
import random
from difflib import SequenceMatcher

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
generator = None
mcq_engine = None

def get_models():
    global generator, mcq_engine
    if generator is None:
        print("Loading QuestionGenerator...")
        generator = QuestionGenerator()
    if mcq_engine is None:
        print("Loading MCQEngine...")
        mcq_engine = MCQEngine()
    return generator, mcq_engine

@app.on_event("startup")
async def startup_event():
    import traceback
    try:
        # Preload models
        get_models()
    except Exception:
        traceback.print_exc()
        # We don't exit here, so uvicorn can run and we can see the error in logs
        print("Startup failed due to exception.")


@app.post("/generate")
async def generate_exam(
    file: UploadFile = File(...),
    difficulty: str = Form("medium"),
    count: int = Form(10),
    mcq: str = Form("true"), # Received as string from ForAppend
    short: str = Form("false"),
    long: str = Form("false")
):
    # Convert string booleans
    is_mcq = mcq.lower() == 'true'
    is_short = short.lower() == 'true'
    is_long = long.lower() == 'true'
    
    print(f"Received request: {file.filename}, count={count}, mcq={is_mcq}, short={is_short}")

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        gen, engine = get_models()
        
        # 1. Read Text
        source = FileDataSource(tmp_path)
        text = source.get_text()
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Empty file or could not extract text")
            
        # 2. Chunk Text
        chunks = chunk_text(text)
        selected_chunks = chunks[:5] # Process up to 5 chunks 
        
        questions = []
        global_id = 1
        
        total_needed = count
        
        # Determine distribution
        types_requested = []
        if is_mcq: types_requested.append('mcq')
        if is_short: types_requested.append('short')
        if is_long: types_requested.append('long')
        
        if not types_requested:
            types_requested = ['mcq'] # Default
            
        # Approximate mix
        
        # 3. Generate Questions loop
        # We'll iterate chunks and try to pull questions until we fill quota
        
        for chunk in selected_chunks:
            if len(questions) >= total_needed:
                break
                
            # Try to get some MCQs
            if is_mcq and len(questions) < total_needed:
                answers = engine.get_candidate_answers(chunk, num_candidates=5)
                for ans in answers:
                    if len(questions) >= total_needed:
                        break
                        
                    q_text = gen.generate_for_answer(ans, chunk)
                    
                    # Dedup
                    if any(SequenceMatcher(None, q_text, q['question']).ratio() > 0.85 for q in questions):
                        continue
                        
                    distractors = engine.get_distractors(ans, chunk)
                    options = distractors + [ans]
                    random.shuffle(options)
                    
                    questions.append({
                        "id": global_id,
                        "type": "mcq",
                        "question": q_text,
                        "options": options,
                        "correct": options.index(ans)
                    })
                    global_id += 1

            # Try to get QA
            if (is_short or is_long) and len(questions) < total_needed:
                q_texts = gen.generate(chunk, num_questions=2)
                for qt in q_texts:
                    if len(questions) >= total_needed:
                        break
                    
                    # Dedup
                    if any(SequenceMatcher(None, qt, q['question']).ratio() > 0.85 for q in questions):
                        continue
                        
                    q_type = "short" if is_short else "long"
                    # If both, random pick?
                    if is_short and is_long:
                        q_type = random.choice(["short", "long"])

                    questions.append({
                        "id": global_id,
                        "type": q_type,
                        "question": qt,
                    })
                    global_id += 1

        return questions

    except Exception as e:
        print(f"Error generating exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    