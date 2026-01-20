import React, { useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { UploadCloud, Presentation, ChevronLeft, ChevronRight, Download, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SlidesGenerator = () => {
  const [file, setFile] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock Slides
  const slides = [
    { title: "Introduction to React", content: ["• Component-Based Architecture", "• Virtual DOM", "• Unidirectional Data Flow"] },
    { title: "Components & Props", content: ["• Functional vs Class Components", "• Passing Data with Props", "• Reusability"] },
    { title: "State Management", content: ["• useState Hook", "• Side Effects with useEffect", "• Custom Hooks"] },
  ];

  const handleGenerate = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setIsGenerated(true);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Slides Generator</h1>
          <p className="text-gray-500 mt-1">Convert PDF notes into presentation decks.</p>
        </div>
        {isGenerated && (
           <Button variant="outline" onClick={() => setIsGenerated(false)}>
             Upload New File
           </Button>
        )}
      </div>

      {!isGenerated ? (
        <div className="flex-1 flex items-center justify-center">
           <Card className="max-w-xl w-full p-12 text-center border-2 border-dashed border-gray-200 hover:border-[hsl(var(--color-primary))] transition-all group cursor-pointer bg-gray-50">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
               <UploadCloud size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Course Material</h3>
             <p className="text-gray-500 mb-8">Supported formats: PDF, DOCX (Max 20MB)</p>
             
             <div className="relative inline-block">
               <Button size="lg" loading={loading} className="shadow-lg shadow-indigo-200">
                 {loading ? 'Generating...' : 'Select File & Generate'}
               </Button>
               <input 
                 type="file" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={(e) => { setFile(e.target.files[0]); handleGenerate(); }} 
                 disabled={loading}
               />
             </div>
           </Card>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
           
           {/* Sidebar Preview */}
           <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 h-full custom-scrollbar">
             {slides.map((slide, idx) => (
               <div 
                 key={idx}
                 onClick={() => setCurrentSlide(idx)}
                 className={`p-4 rounded-xl border-2 cursor-pointer transition-all aspect-video flex flex-col justify-center gap-2 ${currentSlide === idx ? 'border-[hsl(var(--color-primary))] bg-indigo-50' : 'border-transparent bg-white hover:bg-gray-50'}`}
               >
                 <div className="h-2 w-1/2 bg-gray-200 rounded-full mb-1" />
                 <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                 <div className="h-1.5 w-3/4 bg-gray-100 rounded-full" />
                 <span className="text-[10px] text-gray-400 font-bold mt-2">Slide {idx + 1}</span>
               </div>
             ))}
           </div>

           {/* Main Viewer */}
           <div className="lg:col-span-3 flex flex-col h-full">
             <div className="flex-1 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center p-12 relative overflow-hidden">
               <motion.div
                 key={currentSlide}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full max-w-3xl"
               >
                  <h2 className="text-4xl font-bold text-gray-900 mb-8">{slides[currentSlide].title}</h2>
                  <ul className="space-y-6">
                    {slides[currentSlide].content.map((point, i) => (
                      <li key={i} className="text-xl text-gray-600 flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-primary))] mt-2.5 flex-shrink-0" />
                        {point.replace('• ', '')}
                      </li>
                    ))}
                  </ul>
               </motion.div>

               {/* Navigation Overlay */}
               <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
                 <button 
                   onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                   disabled={currentSlide === 0}
                   className="p-3 rounded-full bg-black/5 hover:bg-black/10 disabled:opacity-30 transition-colors"
                 >
                   <ChevronLeft size={24} />
                 </button>
                 <span className="font-mono text-sm text-gray-400 font-bold">
                   {currentSlide + 1} / {slides.length}
                 </span>
                 <button 
                   onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                   disabled={currentSlide === slides.length - 1}
                   className="p-3 rounded-full bg-black/5 hover:bg-black/10 disabled:opacity-30 transition-colors"
                 >
                   <ChevronRight size={24} />
                 </button>
               </div>
             </div>

             <div className="mt-6 flex justify-end gap-3">
               <Button variant="outline">
                 <PlayCircle size={18} className="mr-2" /> Present
               </Button>
               <Button>
                 <Download size={18} className="mr-2" /> Export to PPTX
               </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SlidesGenerator;
