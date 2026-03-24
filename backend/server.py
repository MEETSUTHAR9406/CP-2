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
from src.tutor import SocraticTutor
from src.slide_generator import SlideGenerator
from difflib import SequenceMatcher
import random
import io
import pypdf
from youtube_transcript_api import YouTubeTranscriptApi
import json
from urllib.error import HTTPError
from nltk.corpus import wordnet as wn
from urllib.parse import quote
import urllib.request
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
tutor_model = None
slide_generator_model = None

@app.on_event("startup")
async def startup_event():
    global generator, mcq_engine, summarizer_model, tutor_model, slide_generator_model
    print("Loading models...")
    try:
        generator = QuestionGenerator()
        mcq_engine = MCQEngine()
        summarizer_model = Summarizer()
        tutor_model = SocraticTutor()
        slide_generator_model = SlideGenerator()
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
    file: Optional[UploadFile] = File(None),
    youtube_url: Optional[str] = Form(None),
    num_questions: int = Form(5),
    mode: str = Form('mcq'),
    difficulty: str = Form('medium'),
):
    if not generator or not mcq_engine:
         raise HTTPException(status_code=503, detail="Models are not loaded yet.")

    content = ""
    try:
        # Handle YouTube URL
        if youtube_url:
            try:
                # Extract video ID from URL (basic extraction)
                if "v=" in youtube_url:
                    video_id = youtube_url.split("v=")[1].split("&")[0]
                elif "youtu.be/" in youtube_url:
                    video_id = youtube_url.split("youtu.be/")[1].split("?")[0]
                else:
                    raise ValueError("Invalid YouTube URL format")
                
                api = YouTubeTranscriptApi()
                transcript_list = api.list(video_id).find_transcript(['en', 'hi', 'gu']).fetch()
                content = " ".join([t['text'] for t in transcript_list])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error fetching YouTube transcript: {str(e)}")
                
        # Handle File Upload
        elif file:
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
            answers = mcq_engine.get_candidate_answers(chunk, num_candidates=num_questions)
            for ans in answers:
                question = generator.generate_for_answer(ans, chunk)
                q_data = {
                    "type": "qa", 
                    "text": question, 
                    "answer": ans,
                    "context": chunk,
                    "topic": random.choice(["Math", "Science", "Computer Science"]),
                    "subtopic": random.choice(["Algebra", "Physics", "Web Dev", "Data Structures", "Biology", "Calculus"])
                }
                results.append(q_data)
                # Save to MongoDB
                await db.questions.insert_one(q_data)
                
        elif mode == 'mcq':
            num_distractors = 3
            if difficulty == 'easy':
                num_distractors = 2
            elif difficulty == 'hard':
                num_distractors = 4
                
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
                
                distractors = mcq_engine.get_distractors(ans, chunk, num_distractors=num_distractors)
                options = distractors + [ans]
                random.shuffle(options)
                
                explanation = "Explanation unavailable."
                if tutor_model:
                    explanation = tutor_model.generate_explanation(question, ans, chunk)
                
                q_data = {
                    "type": "mcq",
                    "text": question,
                    "options": options,
                    "answer": ans,
                    "explanation": explanation,
                    "context": chunk,
                    "topic": random.choice(["Math", "Science", "Computer Science"]),
                    "subtopic": random.choice(["Algebra", "Physics", "Web Dev", "Data Structures", "Biology", "Calculus"])
                }
                results.append(q_data)
                
                # Save to MongoDB
                await db.questions.insert_one(q_data)

    # Convert ObjectId to string for JSON serialization if needed, or just return results
    # results already dicts without _id if we defined them before insert_one adds it?
    # insert_one adds _id to the dict in place.
    for q in results:
         if "_id" in q:
             q["_id"] = str(q["_id"])
             
    return {"status": "success", "results": results}

@app.get("/api/dictionary/advanced/{word}")
async def get_advanced_dictionary(word: str):
    """
    Hybrid endpoint that blends Free Dictionary API data with NLP (WordNet) 
    and AI generation (SocraticTutor) for etymology and usage notes.
    """
    if not tutor_model:
        raise HTTPException(status_code=503, detail="AI Tutor model not loaded.")

    word = word.strip().lower()
    
    # 1. Fetch exact structural data from free dictionary API
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            api_data = json.loads(response.read().decode())
    except HTTPError as e:
        if e.code == 404:
            raise HTTPException(status_code=404, detail="Word not found in dictionary.")
        raise HTTPException(status_code=500, detail="External dictionary API failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    base_entry = api_data[0] # Take the first match
    
    # 2. Extract Word Families via NLTK
    families = set()
    try:
        for syn in wn.synsets(word):
            for lemma in syn.lemmas():
                name = lemma.name().replace('_', ' ').lower()
                if name != word:
                    families.add(name)
                for deriv in lemma.derivationally_related_forms():
                    d_name = deriv.name().replace('_', ' ').lower()
                    if d_name != word:
                        families.add(d_name)
    except Exception as e:
        print(f"Error extracting word families: {e}")
        
    family_list = sorted(list(families))[:6] # Top 6 derivatives
    
    # 3. Augment with Local AI Model
    etymology = tutor_model.generate_etymology(word)
    usage_note = tutor_model.generate_usage_note(word)
    
    return {
        "word": base_entry.get("word", word),
        "phonetics": base_entry.get("phonetics", []),
        "meanings": base_entry.get("meanings", []),
        "sourceUrls": base_entry.get("sourceUrls", []),
        "wordFamilies": family_list,
        "aiEtymology": etymology,
        "aiUsageNote": usage_note
    }

@app.post("/api/summarize")
async def summarize_text(
    file: UploadFile = File(None),
    text: str = Form(None),
    youtube_url: Optional[str] = Form(None),
):
    if not summarizer_model:
        raise HTTPException(status_code=503, detail="Summarizer model is not loaded yet.")

    content = ""
    
    # Handle YouTube URL
    if youtube_url:
        try:
            if "v=" in youtube_url:
                video_id = youtube_url.split("v=")[1].split("&")[0]
            elif "youtu.be/" in youtube_url:
                video_id = youtube_url.split("youtu.be/")[1].split("?")[0]
            else:
                raise ValueError("Invalid YouTube URL format")
            
            # Create instance and use list/fetch pattern
            api = YouTubeTranscriptApi()
            transcript_list = api.list(video_id).find_transcript(['en', 'hi', 'gu']).fetch()
            content = " ".join([t['text'] for t in transcript_list])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error fetching YouTube transcript: {str(e)}")
            
    # Handle File Upload
    elif file:
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
        raise HTTPException(status_code=400, detail="No content provided (file, text, or youtube_url required).")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content is empty.")

    summary = summarizer_model.summarize(content)
    return {"summary": summary}

# KNOWLEDGE MAP ENDPOINTS

@app.get("/api/knowledge-map")
async def get_knowledge_map():
    # In a real app, this would aggregate real student data or question banks.
    # Here we aggregate by topic and subtopic from the generated questions collection.
    
    questions = await db.questions.find({}).to_list(length=1000)
    
    nodes_dict = {}
    links = []
    
    # Predefined groups for coloring
    topic_groups = {"Math": 1, "Science": 2, "Computer Science": 3}
    
    for q in questions:
        topic = q.get("topic")
        subtopic = q.get("subtopic")
        
        if not topic or not subtopic:
            continue
            
        # Add Topic Node
        if topic not in nodes_dict:
            nodes_dict[topic] = {
                "id": topic,
                "group": topic_groups.get(topic, 4),
                "val": 10, # Base size
                "description": f"Core area: {topic}"
            }
        else:
            nodes_dict[topic]["val"] += 2 # Grow topic node with more questions
            
        # Add Subtopic Node
        if subtopic not in nodes_dict:
            nodes_dict[subtopic] = {
                "id": subtopic,
                "group": topic_groups.get(topic, 4),
                "val": 5,
                "description": f"Subtopic of {topic}"
            }
        else:
            nodes_dict[subtopic]["val"] += 1
            
        # Create link between topic and subtopic
        link = {"source": topic, "target": subtopic}
        if link not in links:
            links.append(link)
            
    # Convert nodes dict to list
    nodes = list(nodes_dict.values())
    
    # If DB is empty, return some default placeholder data so the map still renders early
    if not nodes:
        return {
            "nodes": [
                {"id": "Start Learning", "group": 1, "val": 20, "description": "Generate some exams to populate your map!"}
            ],
            "links": []
        }
        
    return {"nodes": nodes, "links": links}

# TUTOR ENDPOINTS

class HintRequest(BaseModel):
    question_text: str
    wrong_answer: str
    correct_answer: str
    context: Optional[str] = ""

@app.post("/api/tutor/hint")
async def get_tutor_hint(request: HintRequest):
    if not tutor_model:
        raise HTTPException(status_code=503, detail="Tutor model is not loaded yet.")
    
    hint = tutor_model.generate_hint(
        request.question_text, 
        request.wrong_answer, 
        request.correct_answer, 
        request.context
    )
    
    return {"hint": hint}

@app.get("/api/questions")
async def get_questions(type: Optional[str] = None):
    query = {}
    if type:
        query["type"] = type
    
    # Sort by descending _id to get newest first
    questions = await db.questions.find(query).sort("_id", -1).to_list(length=50)
    for q in questions:
        q['id'] = str(q.pop('_id'))
    return questions

@app.post("/api/exams")
async def create_exam(exam_data: models.ExamCreate):
    exam_dict = exam_data.dict()
    result = await db.exams.insert_one(exam_dict)
    # Remove MongoDB's internal _id if it was added to the dict
    if "_id" in exam_dict:
        exam_dict.pop("_id")
    exam_dict['id'] = str(result.inserted_id)
    return exam_dict

@app.get("/api/exams")
async def get_exams():
    exams = await db.exams.find({}).sort("_id", -1).to_list(length=100)
    for e in exams:
        e['id'] = str(e.pop('_id'))
    return exams

from bson import ObjectId
@app.get("/api/exams/{exam_id}")
async def get_exam(exam_id: str):
    try:
        exam = await db.exams.find_one({"_id": ObjectId(exam_id)})
        if exam:
            exam['id'] = str(exam.pop('_id'))
            return exam
        raise HTTPException(status_code=404, detail="Exam not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid exam ID format")

@app.post("/api/slides/generate")
async def generate_slides(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    if not slide_generator_model:
        raise HTTPException(status_code=503, detail="Slide generator model is not loaded yet.")

    content = ""
    if file:
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
            content = contents_bytes.decode("utf-8", errors="ignore")
    elif text:
        content = text
    else:
        raise HTTPException(status_code=400, detail="No content provided")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content is empty.")

    chunks = chunk_text(content)
    processed_chunks = chunks[:4] # limit for speed
    
    slides = slide_generator_model.generate_presentation(processed_chunks)
    return {"slides": slides}

@app.get("/")
def read_root():
    return {"message": "AI Question Generator API is running"}
