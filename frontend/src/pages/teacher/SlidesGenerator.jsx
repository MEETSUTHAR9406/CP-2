import React, { useState } from 'react';
import { UploadCloud, Presentation, ChevronLeft, ChevronRight, Download, PlayCircle, Palette, Sparkles, Layout as LayoutIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SLIDE_THEMES } from '../../constants/SlideThemes';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { generateSlides } from '../../services/api';

const SlidesGenerator = () => {
  const [file, setFile] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('modern');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Slides state
  const [slides, setSlides] = useState([]);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await generateSlides(file);
      if (data && data.slides && data.slides.length > 0) {
        setSlides(data.slides);
      }
    } catch(err) {
      console.error("Failed to generate slides", err);
      // Fallback to mock slides
    } finally {
      setIsGenerated(true);
      setLoading(false);
      setCurrentSlide(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Slides Generator</h1>
          <p className="text-gray-500 mt-1">Convert PDF notes into presentation decks.</p>
        </div>
        {isGenerated && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowThemePicker(!showThemePicker)} className="gap-2">
              <Palette size={18} /> Theme: {SLIDE_THEMES[theme].name}
            </Button>
            <Button variant="outline" onClick={() => setIsGenerated(false)}>
              Upload New
            </Button>
          </div>
        )}
      </div>

      {showThemePicker && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-lg flex gap-4 overflow-x-auto"
        >
          {Object.entries(SLIDE_THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => { setTheme(key); setShowThemePicker(false); }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all flex flex-col gap-1 items-start ${theme === key ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <span className="text-sm font-bold">{t.name}</span>
              <div className="flex gap-1">
                <div className={`w-3 h-3 rounded-full ${t.accent}`} />
                <div className={`w-3 h-3 rounded-full ${t.bg} border`} />
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {!isGenerated ? (
        <div className="flex-1 flex items-center justify-center">
           <Card className="max-w-xl w-full p-12 text-center border-2 border-dashed border-gray-200 hover:border-indigo-500 transition-all group cursor-pointer bg-gray-50/50">
             <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:rotate-12 transition-transform shadow-sm">
               <Presentation size={48} />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Premium Slides</h3>
             <p className="text-gray-500 mb-8">Upload your course content and let AI craft a stunning presentation in seconds.</p>
             
             <div className="flex flex-col items-center gap-4">
               <div className="relative inline-block">
                 <Button size="lg" loading={loading} className="px-12 py-6 text-lg rounded-2xl shadow-xl shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700">
                   {loading ? (
                     <span className="flex items-center gap-2">
                       <Sparkles className="animate-pulse" size={20} /> Generating Magic...
                     </span>
                   ) : 'Generate Slides'}
                 </Button>
                 <input 
                   type="file" 
                   className="absolute inset-0 opacity-0 cursor-pointer" 
                   onChange={(e) => { 
                     const file = e.target.files[0];
                     if (file) {
                       setFile(file);
                       // We can't call handleGenerate directly because setFile is async
                       // But the user click initiates it. Let's fix the trigger.
                     }
                   }} 
                   disabled={loading}
                 />
               </div>
               {file && <p className="text-sm font-medium text-indigo-600">Selected: {file.name}</p>}
               {file && !loading && (
                 <Button variant="ghost" onClick={handleGenerate} className="text-indigo-600">
                   Start Generation Now
                 </Button>
               )}
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
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all aspect-video flex flex-col justify-center gap-2 group relative overflow-hidden ${currentSlide === idx ? `border-indigo-600 ${SLIDE_THEMES[theme].sidebar}` : 'border-transparent bg-white hover:bg-gray-50'}`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${currentSlide === idx ? SLIDE_THEMES[theme].accent : 'bg-transparent'}`} />
                  <div className="h-2 w-1/2 bg-gray-200 rounded-full mb-1 group-hover:w-3/4 transition-all" />
                  <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                  <div className="h-1.5 w-3/4 bg-gray-100 rounded-full" />
                  <span className={`text-[10px] font-bold mt-2 ${currentSlide === idx ? SLIDE_THEMES[theme].secondary : 'text-gray-400'}`}>
                    Slide {idx + 1}
                  </span>
                </div>
              ))}
            </div>

           {/* Main Viewer */}
            <div className="lg:col-span-3 flex flex-col h-full">
              <div className={`flex-1 ${SLIDE_THEMES[theme].bg} rounded-3xl shadow-2xl border ${SLIDE_THEMES[theme].border} flex items-center justify-center p-16 relative overflow-hidden`}>
                
                {/* Decorative Elements based on Theme */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${SLIDE_THEMES[theme].accent} opacity-[0.03] rounded-full -mr-32 -mt-32 blur-3xl`} />
                <div className={`absolute bottom-0 left-0 w-96 h-96 ${SLIDE_THEMES[theme].accent} opacity-[0.02] rounded-full -ml-48 -mb-48 blur-3xl`} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-4xl z-10"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className={`w-12 h-1.5 rounded-full ${SLIDE_THEMES[theme].accent}`} />
                      <h2 className={`text-5xl font-extrabold ${SLIDE_THEMES[theme].text} tracking-tight leading-tight`}>
                        {slides[currentSlide]?.title || "Generating..."}
                      </h2>
                    </div>

                    <ul className="space-y-8">
                      {slides[currentSlide]?.content?.map((point, i) => (
                        <motion.li 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className={`text-2xl ${SLIDE_THEMES[theme].text} opacity-90 flex items-start gap-5 leading-relaxed`}
                        >
                          <div className={`w-3 h-3 rounded-full ${SLIDE_THEMES[theme].accent} mt-3 flex-shrink-0 shadow-lg`} />
                          <p>{point.replace('• ', '').replace(/^\d+\.\s*/, '')}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Overlay */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-10">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className={`p-4 rounded-full ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'} disabled:opacity-20 transition-colors`}
                  >
                    <ChevronLeft size={28} className={SLIDE_THEMES[theme].text} />
                  </motion.button>
                  
                  <div className="flex flex-col items-center">
                    <span className={`font-mono text-sm font-black tracking-widest ${SLIDE_THEMES[theme].secondary}`}>
                      {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length || 0).padStart(2, '0')}
                    </span>
                    <div className="w-32 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0}%` }}
                         className={`h-full ${SLIDE_THEMES[theme].accent}`}
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                    className={`p-4 rounded-full ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'} disabled:opacity-20 transition-colors`}
                  >
                    <ChevronRight size={28} className={SLIDE_THEMES[theme].text} />
                  </motion.button>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <LayoutIcon size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider italic">AI Enhanced Presentation</span>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="px-6 rounded-xl hover:bg-gray-50 border-gray-200">
                    <PlayCircle size={20} className="mr-2 text-indigo-600" /> Present Mode
                  </Button>
                  <Button className="px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                    <Download size={20} className="mr-2" /> Export PDF
                  </Button>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SlidesGenerator;
