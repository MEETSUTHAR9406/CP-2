import React, { useState } from 'react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { UploadCloud, Edit2, RefreshCw, Trash2, CheckCircle, Save, ArrowRight, Layout, Type } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'mixed', label: 'Mixed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

const QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple Choice', icon: Layout },
  { id: 'short', label: 'Short Answer', icon: Type },
  { id: 'long', label: 'Long Answer', icon: File },
];

const MOCKED_QUESTIONS = [
  { id: 1, type: 'mcq', question: "What is the time complexity of Binary Search?", options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], correct: 1 },
  { id: 2, type: 'short', question: "Define 'Recursion' in one sentence." },
  { id: 3, type: 'long', question: "Explain the full lifecycle of a React Component with examples." },
  { id: 4, type: 'mcq', question: "Which data structure uses LIFO principle?", options: ["Queue", "Stack", "Array", "Tree"], correct: 1 },
];

const ExamGenerator = () => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Editor, 3: Preview/Publish
  const [file, setFile] = useState(null);
  const [config, setConfig] = useState({
    difficulty: 'medium',
    types: { mcq: true, short: true, long: false },
    count: 10
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [examId, setExamId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('difficulty', config.difficulty);
      formData.append('count', config.count);
      formData.append('mcq', config.types.mcq);
      formData.append('short', config.types.short);
      formData.append('long', config.types.long);

      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data);
      setStep(2);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate questions. Ensure backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (typeId) => {
    setConfig(c => ({
      ...c,
      types: { ...c.types, [typeId]: !c.types[typeId] }
    }));
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditValue(q.question);
  };

  const saveEdit = () => {
    setQuestions(qs => qs.map(q => q.id === editingId ? { ...q, question: editValue } : q));
    setEditingId(null);
  };

  const handlePublish = () => {
    setLoading(true);
    setTimeout(() => {
      const generatedId = `EX-${Math.floor(1000 + Math.random() * 9000)}-2026`;
      localStorage.setItem('qq_published_exam', JSON.stringify({
         id: generatedId,
         questions,
         title: 'Generated Exam'
      }));
      setExamId(generatedId);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const deleteQuestion = (id) => {
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  /* ---------------- STEP 1: SETUP ---------------- */
  if (step === 1) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Exam</h1>
          <p className="text-gray-500">Configure parameters to auto-generate questions from your material.</p>
        </div>

        <Card className="p-8 space-y-8 shadow-xl border-gray-100">
          {/* Upload */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">1. Source Material</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50 hover:border-[hsl(var(--color-primary))] transition-all relative group bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform text-[hsl(var(--color-primary))]">
                 <UploadCloud size={32} />
              </div>
              {file ? (
                <div className="animate-fade-in">
                   <span className="text-[hsl(var(--color-primary))] font-bold text-lg">{file.name}</span>
                   <p className="text-xs text-gray-400 mt-1">Ready for analysis</p>
                </div>
              ) : (
                <>
                  <span className="text-gray-600 font-medium text-lg block mb-1">Upload PDF Chapter or Notes</span>
                  <span className="text-gray-400 text-sm">Drag & drop or click to browse</span>
                </>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Difficulty */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">2. Difficulty</label>
              <div className="grid grid-cols-2 gap-3">
                {DIFFICULTY_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setConfig({ ...config, difficulty: level.id })}
                    className={clsx(
                      "px-4 py-3 rounded-xl font-bold text-sm transition-all border-2",
                      config.difficulty === level.id 
                        ? `${level.color} shadow-sm transform scale-105`
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">3. Format</label>
              <div className="space-y-2">
                {QUESTION_TYPES.map(type => (
                  <label key={type.id} className={clsx(
                    "flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                    config.types[type.id] ? "border-[hsl(var(--color-primary))] bg-indigo-50" : "border-gray-100 hover:bg-gray-50"
                  )}>
                    <input 
                      type="checkbox" 
                      checked={config.types[type.id]}
                      onChange={() => handleTypeToggle(type.id)}
                      className="w-5 h-5 rounded text-[hsl(var(--color-primary))] border-gray-300 focus:ring-0"
                    />
                    <span className={clsx("ml-3 font-medium", config.types[type.id] ? "text-[hsl(var(--color-primary))]" : "text-gray-600")}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <Button size="lg" className="w-full text-lg shadow-lg shadow-indigo-200" onClick={handleGenerate} loading={loading} disabled={!file && !config.difficulty}>
              Generate Exam Draft
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------------- STEP 2: EDITOR ---------------- */
  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto py-6 pb-20">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[hsl(var(--color-bg))] z-20 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Questions</h2>
            <p className="text-sm text-gray-500">Edit or replace questions before publishing.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handlePublish} loading={loading} className="px-6 shadow-md shadow-indigo-100">
              <Save size={18} className="mr-2" />
              Publish Exam
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q, idx) => (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               key={q.id}
            >
              <Card className="p-6 group hover:shadow-md transition-shadow border-gray-200">
                <div className="flex items-start gap-5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1">
                    {editingId === q.id ? (
                      <div className="flex gap-3 items-start animate-fade-in">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full p-4 border-2 border-[hsl(var(--color-primary))] rounded-xl focus:outline-none min-h-[100px] text-gray-900"
                          autoFocus
                        />
                        <div className="flex flex-col gap-2">
                          <button onClick={saveEdit} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"><CheckCircle size={20} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-lg text-gray-900 mb-3 leading-relaxed">{q.question}</div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 text-xs text-gray-500 uppercase tracking-wide font-bold">
                            <span className="bg-gray-100 px-3 py-1 rounded-md">{q.type}</span>
                            {q.type === 'mcq' && <span className="pt-1 text-gray-400">• {q.options.length} Options</span>}
                          </div>

                          {/* Hover Actions */}
                          <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-200">
                             <button onClick={() => startEdit(q)} className="flex items-center text-xs font-bold text-indigo-600 hover:underline">
                               <Edit2 size={14} className="mr-1" /> Edit
                             </button>
                             <button onClick={() => deleteQuestion(q.id)} className="flex items-center text-xs font-bold text-red-500 hover:underline">
                               <Trash2 size={14} className="mr-1" /> Remove
                             </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          <button className="w-full py-5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] hover:bg-white transition-all flex items-center justify-center gap-2 group">
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            Generate More Questions
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- STEP 3: PUBLISHED ---------------- */
  return (
    <div className="max-w-2xl mx-auto pt-20 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="p-16 shadow-2xl border-none">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-short">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Exam Published!</h2>
          <p className="text-gray-500 mb-10 text-lg">Your exam is live. Share the ID below with your students.</p>
          
          <div className="bg-gray-900 text-white p-8 rounded-2xl mb-10 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-50" />
            <span className="text-gray-400 text-sm uppercase tracking-[0.2em] mb-3 font-bold relative z-10">Exam ID</span>
            <div className="text-5xl font-mono font-bold tracking-widest relative z-10 select-all selection:bg-indigo-500">{examId}</div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => { setStep(1); setQuestions([]); }} className="text-gray-600 border-gray-200">
              Create Another
            </Button>
            <Button onClick={() => window.print()} className="shadow-lg shadow-indigo-200">
               Download PDF
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ExamGenerator;
