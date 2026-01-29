from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Any

# Auth Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    name: str
    email: str
    hashed_password: str
    role: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_role: str
    
class TokenData(BaseModel):
    email: Optional[str] = None

# Question Models (for API response/validation)
class QuestionBase(BaseModel):
    text: str
    type: str # 'mcq' or 'qa'
    options: Optional[List[str]] = None
    answer: Optional[str] = None
    context: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: Optional[str] = None # MongoDB ID is string
    
    class Config:
        arbitrary_types_allowed = True
