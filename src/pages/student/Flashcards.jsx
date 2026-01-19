import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { ChevronLeft, ChevronRight, Bookmark, Sparkles, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { useStats } from '../../context/StatsContext';

const MOCK_CARDS = [
  { id: 1, front: "What is React's Virtual DOM?", back: "A lightweight copy of the real DOM that React uses to optimize updates." },
  { id: 2, front: "Explain 'State' vs 'Props'.", back: "State is internal/mutable mock data. Props are external/read-only data passed down." },
  { id: 3, front: "What is a Hook?", back: "A function that lets you 'hook into' React features like state and lifecycle from functional components." },
];

const Flashcards = () => {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
   // Safe stats context usage
   let awardXP = () => {};
   try {
     const statsCtx = useStats();
     if (statsCtx) awardXP = statsCtx.awardXP;
   } catch (e) { console.warn("StatsContext missing"); }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        awardXP(5, 'flashcard');
      }, 200);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
        <p className="text-gray-500 mt-2">Master concepts with spaced repetition.</p>
      </div>

      <div className="w-full max-w-xl perspective-1000 relative group">
        <div 
          className="relative w-full aspect-[16/10] cursor-pointer transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-white border-b-4 border-b-[hsl(var(--color-primary))] shadow-xl hover:shadow-2xl transition-shadow rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Question</span>
              <h3 className="text-2xl font-bold text-center text-gray-800 leading-relaxed">
                {currentCard.front}
              </h3>
              <div className="absolute bottom-6 text-xs font-medium text-gray-400 animate-pulse">
                Click to flip
              </div>
            </Card>
          </div>

          {/* Back Face */}
          <div 
            className="absolute inset-0 backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-[hsl(var(--color-bg))] border-b-4 border-b-[hsl(var(--color-secondary))] shadow-xl rounded-2xl">
              <span className="text-xs font-bold text-[hsl(var(--color-secondary))] uppercase tracking-widest mb-4">Answer</span>
              <p className="text-xl font-medium text-center text-gray-700 leading-relaxed">
                {currentCard.back}
              </p>
            </Card>
          </div>
        </div>

        {/* Floating Actions */}
        <div className="absolute -right-16 top-0 bottom-0 flex flex-col justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-3 bg-white rounded-full shadow-lg text-gray-400 hover:text-amber-500 hover:scale-110 transition-all">
             <Bookmark size={20} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
             className="p-3 bg-white rounded-full shadow-lg text-gray-400 hover:text-[hsl(var(--color-primary))] hover:scale-110 transition-all"
           >
             <RotateCcw size={20} />
           </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mt-10">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </Button>
        
        <div className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>

        <Button 
          onClick={handleNext} 
          disabled={currentIndex === cards.length - 1}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg shadow-[hsl(var(--color-primary))/30]"
        >
          <ChevronRight size={24} />
        </Button>
      </div>

    </div>
  );
};

export default Flashcards;
