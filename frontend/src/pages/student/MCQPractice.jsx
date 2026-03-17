import React, { useState } from 'react';
import { generateQuestions, getTutorHint, getQuestions } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { UploadCloud, CheckCircle, XCircle, Award, ArrowRight, RefreshCcw, BookOpen, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useStats } from '../../context/StatsContext';

const MOCK_QUIZ = [
  {
    id: 1,
    question: "Which hook is used for side effects in React?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correct: 1 // Index
  },
  {
    id: 2,
    question: "What is the virtual DOM?",
    options: ["A direct copy of HTML", "A lightweight JS representation of DOM", "A browser engine", "A separate server"],
    correct: 1
  },
  {
    id: 3,
    question: "How do you pass data to child components?",
    options: ["State", "Props", "Context", "Redux"],
    correct: 1
  }
];

const MCQPractice = () => {
  const [questions, setQuestions] = useState(MOCK_QUIZ);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup, quiz, result
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Tutor State
  const [tutorHint, setTutorHint] = useState(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Safe stats context usage
  let awardXP = () => { };
  try {
    const statsCtx = useStats();
    if (statsCtx) awardXP = statsCtx.awardXP;
  } catch (e) { console.warn("StatsContext missing"); }

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const data = await getQuestions('mcq');
      if (data && data.length > 0) {
          const formattedQuestions = data.map((item, index) => ({
             id: item.id || index,
             question: item.text,
             options: item.options,
             correct: item.options.indexOf(item.answer),
             context: item.context
          }));
          // Shuffle and take top 10
          setQuestions(formattedQuestions.sort(() => 0.5 - Math.random()).slice(0, 10));
      } else {
          setQuestions(MOCK_QUIZ);
      }
    } catch(err) {
      console.error(err);
      setQuestions(MOCK_QUIZ);
    } finally {
      setIsLoading(false);
      setPhase('quiz');
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
      setTutorHint(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await generateQuestions(file);
      // Transform API response to match component state structure
      // API returns: { results: [{ type: 'mcq', question, options, answer, context }] }
      const formattedQuestions = data.results.map((item, index) => ({
        id: index,
        question: item.text, // Use item.text as per backend structure
        options: item.options,
        correct: item.options.indexOf(item.answer), 
        context: item.context
      }));

      setQuestions(formattedQuestions);
      setPhase('quiz');
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
      setTutorHint(null);
    } catch (error) {
      console.error("Quiz generation failed:", error);
      alert("Failed to generate quiz from file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = async (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setTutorHint(null); // Clear previous hints if any

    const question = questions[currentQuestionIndex];
    const isCorrect = index === question.correct;

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      // Wrong answer selected, fetch a socratic hint
      setIsHintLoading(true);
      try {
        const payload = {
          question_text: question.question || "This question",
          wrong_answer: question.options[index] || "an incorrect option",
          correct_answer: question.options[question.correct] || "the correct answer",
          context: question.context || ""
        };
        const response = await getTutorHint(payload);
        setTutorHint(response.hint);
      } catch (error) {
        console.error("Failed to load hint:", error);
        setTutorHint("Could not fetch a hint at this time.");
      } finally {
        setIsHintLoading(false);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setTutorHint(null);
    } else {
      setPhase('result');
      awardXP(score * 10, 'mcq');
    }
  };

  /* ---------------- SETUP PHASE ---------------- */
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">MCQ Practice</h1>
        <p className="text-gray-500 mb-8">Upload material or start a general quiz to test your knowledge.</p>

        <div className="space-y-4">
          {/* Upload Card */}
          <Card className="p-8 border-2 border-dashed border-gray-200 hover:border-[hsl(var(--color-primary))] transition-all cursor-pointer group bg-gray-50 hover:bg-white relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <UploadCloud size={32} className={clsx("text-gray-400 group-hover:text-[hsl(var(--color-primary))]", isLoading && "animate-bounce")} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">{isLoading ? "Generating Quiz..." : "Upload Study Material (PDF)"}</h3>
              <p className="text-sm text-gray-500 mt-1">{isLoading ? "AI is reading your document..." : "AI will generate custom questions for you"}</p>
            </div>
            <input type="file" accept=".pdf,.txt" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isLoading} />
          </Card>

          <div className="text-center text-sm font-medium text-gray-400 my-4">OR</div>

          <Card className="p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={startQuiz}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">General Knowledge Quiz</h3>
                <p className="text-xs text-gray-500">React & Web Development Basics</p>
              </div>
            </div>
            <Button size="sm" variant="ghost"><ArrowRight size={20} /></Button>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------------- RESULT PHASE ---------------- */
  if (phase === 'result') {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
            <Award size={48} className="text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8">Great job on finishing the practice session.</p>

          <Card className="p-8 mb-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-none">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Your Score</div>
            <div className="text-6xl font-black text-gray-900 mb-2">{score} <span className="text-2xl text-gray-400 font-medium">/ {questions.length}</span></div>
            <div className="inline-block px-3 py-1 bg-white rounded-full text-xs font-bold text-green-600 shadow-sm">
              +{score * 10} XP Earned
            </div>
          </Card>

          <Button onClick={() => setPhase('setup')} size="lg" className="w-full">
            <RefreshCcw size={18} className="mr-2" /> Start New Quiz
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ---------------- QUIZ PHASE ---------------- */
  const question = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
          <span>Question {currentQuestionIndex + 1}</span>
          <span>{questions.length} Total</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[hsl(var(--color-primary))] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-8 mb-6 shadow-lg border-t-4 border-t-[hsl(var(--color-primary))]">
        <h2 className="text-xl font-bold text-gray-900 leading-relaxed mb-8">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correct;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            let borderClass = "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
            let bgClass = "bg-white";
            let textClass = "text-gray-700";

            if (showCorrect) {
              borderClass = "border-green-500 ring-1 ring-green-500";
              bgClass = "bg-green-50";
              textClass = "text-green-700 font-medium";
            } else if (showWrong) {
              borderClass = "border-red-500 ring-1 ring-red-500";
              bgClass = "bg-red-50";
              textClass = "text-red-700";
            } else if (isSelected) {
              borderClass = "border-[hsl(var(--color-primary))] ring-1 ring-[hsl(var(--color-primary))]";
              bgClass = "bg-indigo-50";
              textClass = "text-[hsl(var(--color-primary))] font-medium";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={clsx(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                  borderClass, bgClass, textClass
                )}
              >
                <span>{option}</span>
                {showCorrect && <CheckCircle size={20} className="text-green-500" />}
                {showWrong && <XCircle size={20} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Tutor Hint UI section */}
        <AnimatePresence>
          {(isHintLoading || tutorHint) && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                  <Lightbulb size={24} className={isHintLoading ? "animate-pulse" : ""} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-900 mb-1 text-sm uppercase tracking-wide">AI Tutor Hint</h4>
                  {isHintLoading ? (
                    <div className="space-y-2 mt-2">
                      <div className="h-4 bg-amber-200/50 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-amber-200/50 rounded w-1/2 animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-amber-800 text-sm leading-relaxed font-medium">{tutorHint}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </Card>

      <div className="flex justify-end">
        <Button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="px-8"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MCQPractice;
