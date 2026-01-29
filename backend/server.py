from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
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
import models
from database import db
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# AUTH ENDPOINTS

@app.post("/api/signup", response_model=models.Token)
async def signup(user: models.UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_in_db = models.UserInDB(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    
    result = await db.users.insert_one(user_in_db.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.name,
        "user_role": user.role
    }

@app.post("/api/token", response_model=models.Token)
async def login(user_data: models.UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user["name"],
        "user_role": user["role"]
    }

# GENERATION ENDPOINTS

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
    
    # Generate questions
    for i, chunk in enumerate(processed_chunks):
        if mode == 'qa':
            questions = generator.generate(chunk, num_questions=num_questions)
            for q in questions:
                q_data = {"type": "qa", "text": q, "context": chunk}
                results.append(q_data)
                # Save to MongoDB
                await db.questions.insert_one(q_data)
                
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
                
                q_data = {
                    "type": "mcq",
                    "text": question,
                    "options": options,
                    "answer": ans,
                    "context": chunk
                }
                results.append(q_data)
                
                # Save to MongoDB
                await db.questions.insert_one(q_data)

    # Convert ObjectId to string for JSON serialization if needed, or just return results
    # results already dicts without _id if we defined them before insert_one adds it?
    # insert_one adds _id to the dict in place.
    for r in results:
        if '_id' in r:
            del r['_id']

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
