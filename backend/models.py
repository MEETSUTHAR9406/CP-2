from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    type = Column(String, index=True) # 'mcq' or 'qa'
    options = Column(JSON, nullable=True) # For MCQ options
    answer = Column(Text, nullable=True) # Correct answer or answer text
    context = Column(Text, nullable=True) # The chunk of text used to generate strictly
    created_at = Column(DateTime, default=datetime.utcnow)
