import React, { useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { UploadCloud, FileText, Sparkles, Copy, Check, Bookmark, AlignLeft, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStats } from '../../context/StatsContext';
import clsx from 'clsx';

const Summarizer = () => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'pdf'
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Safe stats context usage
  let awardXP = () => {};
  try {
    const statsCtx = useStats();
    if (statsCtx) awardXP = statsCtx.awardXP;
  } catch (e) {
    console.warn("StatsContext not found");
  }

  const handleGenerate = async () => {
    if (!inputText && !file) return;
    setLoading(true);
    // Mock API call
    await new Promise(r => setTimeout(r, 2000));
    setSummary("This is a generated summary of the content. The input text has been analyzed to extract key points, main arguments, and essential data. \n\n• Key Point 1: The core concept revolves around modular design.\n• Key Point 2: User experience is paramount for retention.\n• Key Point 3: Efficient algorithms reduce load times.\n\n(This is a mock AI output for demonstration purposes.)");
    setBookmarked(false);
    awardXP(10, 'summary');
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmark = () => {
    if (!summary) return;
    setBookmarked(prev => !prev);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Summarizer</h1>
        <p className="text-gray-500 mt-1">Transform long documents into concise insights in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="space-y-4">
           {/* Tabs */}
           <div className="bg-gray-100 p-1 rounded-xl inline-flex w-full">
             <button
               onClick={() => setActiveTab('text')}
               className={clsx(
                 "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                 activeTab === 'text' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
               )}
             >
               <AlignLeft size={18} /> Text Input
             </button>
             <button
               onClick={() => setActiveTab('pdf')}
               className={clsx(
                 "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                 activeTab === 'pdf' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
               )}
             >
               <FileType size={18} /> Upload PDF
             </button>
           </div>

           <Card className="min-h-[400px] flex flex-col p-6 border-gray-200 shadow-sm">
             {activeTab === 'text' ? (
                <textarea
                  className="w-full flex-1 p-4 bg-gray-50 rounded-xl border-none resize-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] placeholder:text-gray-400 outline-none transition-all"
                  placeholder="Paste your text here to summarize..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
             ) : (
               <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-gray-50 hover:border-[hsl(var(--color-primary))] transition-all cursor-pointer group relative">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  {file ? (
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="mt-3 text-red-500 text-xs font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium text-gray-700">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-2">PDF, DOCX up to 10MB</p>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.docx,.txt" />
               </div>
             )}

             <div className="mt-6 flex justify-end">
               <Button 
                 onClick={handleGenerate} 
                 loading={loading}
                 disabled={(!inputText && !file) || loading}
                 className="w-full md:w-auto px-8"
               >
                 <Sparkles size={18} className="mr-2" />
                 Generate Summary
               </Button>
             </div>
           </Card>
        </div>

        {/* Output Section */}
        <div className="h-full">
          <Card className={clsx("h-full min-h-[400px] flex flex-col relative overflow-hidden transition-all", summary ? "bg-white border-gray-200" : "bg-gray-50 border-dashed border-gray-200")}>
            
            {!summary && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center pointer-events-none">
                <FileText size={48} className="mb-4 text-gray-300" />
                <p>Your summary will appear here</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm">
                <div className="w-8 h-8 border-4 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-[hsl(var(--color-primary))] animate-pulse">Analyzing content...</p>
              </div>
            )}

            {summary && (
              <>
                 <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-[hsl(var(--color-primary))]" /> 
                      Key Insights
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={toggleBookmark} className={clsx("p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-400", bookmarked && "text-amber-500 bg-amber-50 hover:bg-amber-100")}>
                        <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
                      </button>
                      <button onClick={handleCopy} className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-900">
                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                    </div>
                 </div>
                 <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed overflow-y-auto pr-2 custom-scrollbar flex-1">
                   {summary.split('\n').map((line, i) => (
                     <p key={i} className={clsx("mb-3", line.startsWith('•') && "pl-4 font-medium text-gray-800")}>
                       {line}
                     </p>
                   ))}
                 </div>
              </>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Summarizer;
