import React, { useState, useEffect } from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import { Clock, FileText, CheckCircle, AlertCircle, ArrowRight, Timer } from 'lucide-react';
import clsx from 'clsx';
import { useStats } from '../../context/StatsContext';

const MOCK_EXAM = {
  id: "EX-2025-001",
  title: "React & Modern JS Final",
  duration: 45, // minutes
  questions: [
    { id: 1, type: 'mcq', question: "What is the primary purpose of useEffect?", options: ["State management", "Side effects", "Routing", "Styling"], correct: 1 },
    { id: 2, type: 'short', question: "Explain the concept of 'Lifting State Up'." },
    { id: 3, type: 'mcq', question: "Which method creates a reference to a DOM element?", options: ["useState", "useRef", "useMemo", "useCallback"], correct: 1 }
  ]
};

const ExamAttempt = () => {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('idle'); // idle, taking, submitted
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Safe stats
  let awardXP = () => {};
  try {
     const statsCtx = useStats();
     if (statsCtx) awardXP = statsCtx.awardXP;
  } catch (e) {}

  useEffect(() => {
    let timer;
    if (status === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'taking') {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const handleFetchExam = () => {
    if (!examId.trim()) return;
    const trimmed = examId.trim().toUpperCase();
    
    // Check local published exam
    const stored = localStorage.getItem('qq_published_exam');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id === trimmed) {
          setExam(parsed);
          setTimeLeft((parsed.duration || 45) * 60);
          setStatus('taking');
          setAnswers({});
          return;
        }
      } catch (e) {}
    }

    if (trimmed === 'DEMO' || trimmed === MOCK_EXAM.id) {
      setExam(MOCK_EXAM);
      setTimeLeft(MOCK_EXAM.duration * 60);
      setStatus('taking');
      setAnswers({});
    } else {
      alert("Exam not found. Try 'DEMO' or an ID from your teacher.");
    }
  };

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    if (status !== 'taking') return;
    if (confirm("Are you sure you want to finish the exam?")) {
      setStatus('submitted');
      // Calculate basic mock score XP
      const answeredCount = Object.keys(answers).length;
      const total = exam?.questions?.length || 1;
      const completionRatio = answeredCount / total;
      const earnedXp = Math.round(100 * completionRatio);
      awardXP(earnedXp, 'exam');
    }
  };

  /* ---------------- IDLE STATE ---------------- */
  if (status === 'idle') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Exam Portal</h1>
        <p className="text-gray-500 mb-10 text-lg">Enter your unique Exam ID to begin your assessment.</p>
        
        <Card className="p-10 shadow-xl border-t-4 border-t-[hsl(var(--color-primary))]">
          <div className="mb-6 text-left">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 block">Exam Session ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                placeholder="e.g. EX-2025-001"
                className="flex-1 p-3 border border-gray-300 rounded-lg font-mono text-lg uppercase focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Ask your instructor for the code.</p>
          </div>
          
          <Button onClick={handleFetchExam} size="lg" className="w-full shadow-lg shadow-indigo-200">
            Start Exam <ArrowRight size={20} className="ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  /* ---------------- SUBMITTED STATE ---------------- */
  if (status === 'submitted') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submission Received</h2>
          <p className="text-gray-500 mb-8">Your answers have been securely recorded.</p>
          
          <Card className="p-8 mb-8 bg-gray-50 border-none">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Status</div>
            <div className="text-xl font-bold text-gray-900">Pending Grading</div>
          </Card>

          <Button onClick={() => { setStatus('idle'); setExamId(''); }} variant="outline">
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ---------------- TAKING STATE ---------------- */
  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[hsl(var(--color-bg))] z-30 py-4 border-b border-gray-200 mb-8 flex justify-between items-center bg-opacity-95 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{exam.title}</h2>
          <div className="text-sm text-gray-500">
             {Object.keys(answers).length} of {exam.questions.length} Answered
          </div>
        </div>
        <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg", timeLeft < 300 ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-900 text-white")}>
          <Timer size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-8">
        {exam.questions.map((q, idx) => (
          <Card key={q.id} className="p-8 shadow-md hover:shadow-lg transition-shadow border-gray-100">
             <div className="flex gap-4">
               <div className="w-8 h-8 bg-indigo-50 text-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                 {idx + 1}
               </div>
               <div className="flex-1">
                 <h3 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">{q.question}</h3>
                 
                 {q.type === 'mcq' && (
                   <div className="space-y-3">
                     {q.options.map((opt, optIdx) => (
                       <label 
                         key={optIdx} 
                         className={clsx(
                           "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 group",
                           answers[q.id] === optIdx 
                             ? "border-[hsl(var(--color-primary))] bg-indigo-50/50" 
                             : "border-gray-200"
                         )}
                       >
                         <input 
                           type="radio" 
                           name={`q-${q.id}`} 
                           className="w-5 h-5 text-[hsl(var(--color-primary))] focus:ring-indigo-500"
                           onChange={() => handleAnswer(q.id, optIdx)}
                           checked={answers[q.id] === optIdx}
                         />
                         <span className={clsx("ml-3", answers[q.id] === optIdx ? "text-[hsl(var(--color-primary))] font-medium" : "text-gray-700")}>
                           {opt}
                         </span>
                       </label>
                     ))}
                   </div>
                 )}

                 {(q.type === 'short' || q.type === 'long') && (
                   <textarea 
                     className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[hsl(var(--color-primary))] focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white"
                     rows={q.type === 'long' ? 5 : 2}
                     placeholder="Type your answer here..."
                     onChange={(e) => handleAnswer(q.id, e.target.value)}
                     value={answers[q.id] || ''}
                   />
                 )}
               </div>
             </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Button size="lg" onClick={handleSubmit} className="px-10 shadow-xl shadow-green-200 bg-green-600 hover:bg-green-700">
          Submit Exam <CheckCircle size={20} className="ml-2" />
        </Button>
      </div>

    </div>
  );
};

export default ExamAttempt;
