from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import tempfile
from src.generator import QuestionGenerator, chunk_text
from src.mcq_engine import MCQEngine
from src.summarizer import Summarizer
from difflib import SequenceMatcher
import random
import io
import pypdf

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], # Vite default port & fallback
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models (loaded on startup)
generator = None
mcq_engine = None
summarizer_model = None

@app.on_event("startup")
async def startup_event():
    global generator, mcq_engine, summarizer_model
    print("Loading models...")
    try:
        generator = QuestionGenerator()
        mcq_engine = MCQEngine()
        summarizer_model = Summarizer()
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.post("/api/generate")
async def generate_questions(
    file: UploadFile = File(...),
    num_questions: int = Form(5),
    mode: str = Form('mcq'),
):
    if not generator or not mcq_engine:
         raise HTTPException(status_code=503, detail="Models are not loaded yet.")

    content = ""
    try:
        # Save upload to temp file or read directly
        contents_bytes = await file.read()
        
        # Check if file is PDF based on filename or mime type (basic check)
        if file.filename.lower().endswith('.pdf'):
            try:
                # Process PDF
                pdf_file = io.BytesIO(contents_bytes)
                reader = pypdf.PdfReader(pdf_file)
                text_content = []
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)
                content = "\n".join(text_content)
            except Exception as e:
                 raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")
        else:
            # Assume text/plain
            content = contents_bytes.decode("utf-8")

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    if not content.strip():
        raise HTTPException(status_code=400, detail="File is empty or no text could be extracted.")

    chunks = chunk_text(content)
    
    # Limit processing for demo performance
    processed_chunks = chunks[:3] 
    
    results = []

    for i, chunk in enumerate(processed_chunks):
        if mode == 'qa':
            questions = generator.generate(chunk, num_questions=num_questions)
            for q in questions:
                results.append({"type": "qa", "question": q, "context": chunk})
        elif mode == 'mcq':
            answers = mcq_engine.get_candidate_answers(chunk, num_candidates=num_questions * 3)
            seen_questions = []
            
            for ans in answers:
                if len(seen_questions) >= num_questions:
                    break
                    
                question = generator.generate_for_answer(ans, chunk)
                
                # Dedup
                is_duplicate = False
                for existing_q in seen_questions:
                     if SequenceMatcher(None, question, existing_q).ratio() > 0.85:
                         is_duplicate = True
                         break
                
                if is_duplicate:
                    continue

                seen_questions.append(question)
                
                distractors = mcq_engine.get_distractors(ans, chunk)
                options = distractors + [ans]
                random.shuffle(options)
                
                results.append({
                    "type": "mcq",
                    "question": question,
                    "options": options,
                    "answer": ans,
                    "context": chunk
                })

    return {"results": results}

@app.post("/api/summarize")
async def summarize_text(
    file: UploadFile = File(None),
    text: str = Form(None),
):
    if not summarizer_model:
        raise HTTPException(status_code=503, detail="Summarizer model is not loaded yet.")

    content = ""
    
    # Handle File Upload
    if file:
        try:
            contents_bytes = await file.read()
            if file.filename.lower().endswith('.pdf'):
                try:
                    pdf_file = io.BytesIO(contents_bytes)
                    reader = pypdf.PdfReader(pdf_file)
                    text_content = []
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text_content.append(extracted)
                    content = "\n".join(text_content)
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")
            else:
                content = contents_bytes.decode("utf-8")
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
            
    # Handle direct text input
    elif text:
        content = text
    else:
        raise HTTPException(status_code=400, detail="No content provided (file or text required).")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content is empty.")

    summary = summarizer_model.summarize(content)
    return {"summary": summary}

@app.get("/")
def read_root():
    return {"message": "AI Question Generator API is running"}
