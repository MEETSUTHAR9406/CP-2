import React, { useState, useEffect } from 'react';
import { Search, Volume2, Clock, History, BookOpen, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import clsx from 'clsx';
import { getAdvancedDictionary } from '../../services/api';

const AIDictionary = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('dictionary_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dictionary_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (wordToSearch) => {
    const word = wordToSearch.trim();
    if (!word) return;

    setQuery(word);
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await getAdvancedDictionary(word);
      setResult(data);
      
      // Update History without duplicates
      setHistory(prev => {
        const filtered = prev.filter(w => w.toLowerCase() !== data.word.toLowerCase());
        return [data.word, ...filtered].slice(0, 10); // Keep last 10
      });
    } catch (err) {
      setError(err.message || 'Word not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error("Audio playback error", e));
  };

  const handleChipClick = (word) => {
    handleSearch(word);
  };

  const phoneticObj = result?.phonetics?.find(p => p.audio && p.text) || result?.phonetics?.[0];
  const audioUrl = phoneticObj?.audio || result?.phonetics?.find(p => p.audio)?.audio;
  const phoneticText = phoneticObj?.text || '';

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[80vh]">
      
      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl flex flex-col gap-6">
        
        {/* Header & Search */}
        <div className="w-full">
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen size={32} className="text-indigo-600" />
            AI Dictionary
          </h1>
          <p className="text-gray-500 mb-6 font-medium">An intelligent dictionary with AI-generated etymologies and robust word tracking.</p>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} 
            className="relative flex items-center w-full shadow-sm rounded-2xl bg-white border-2 border-transparent focus-within:border-indigo-500 transition-all group"
          >
            <Search size={22} className="absolute left-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Type any English word and hit Enter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-5 bg-transparent outline-none text-lg text-gray-900 placeholder:text-gray-400 rounded-2xl"
            />
            <Button 
              type="submit" 
              className="absolute right-2 px-8 py-3 rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 font-bold"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Define'}
            </Button>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {isLoading && (
          <div className="animate-pulse space-y-8 mt-4 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
             <div className="h-10 bg-gray-200 w-1/3 rounded-xl mb-4"></div>
             <div className="h-5 bg-gray-100 w-1/4 rounded-lg"></div>
             <div className="h-px bg-gray-100 w-full my-6"></div>
             <div className="space-y-4">
                <div className="h-5 bg-gray-100 w-full rounded-lg"></div>
                <div className="h-5 bg-gray-100 w-5/6 rounded-lg"></div>
             </div>
          </div>
        )}

        {!isLoading && result && (
          <div className="animate-fade-in space-y-6">
            
            {/* Main Word Header */}
            <Card className="p-8 border-t-4 border-t-indigo-600 shadow-xl bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mx-20 -my-20 opacity-50 pointer-events-none" />
               
               <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
                 <div className="flex items-center gap-4">
                   <h2 className="text-5xl font-black text-gray-900 tracking-tight capitalize">{result.word}</h2>
                   {audioUrl && (
                     <button 
                       onClick={() => playAudio(audioUrl)}
                       className="p-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-full transition-all shadow-sm hover:shadow-md"
                       title="Listen to pronunciation"
                     >
                       <Volume2 size={24} />
                     </button>
                   )}
                 </div>
                 {phoneticText && (
                   <div className="text-indigo-600 font-medium text-xl bg-indigo-50 px-4 py-1.5 rounded-lg border border-indigo-100">
                     {phoneticText}
                   </div>
                 )}
               </div>

               {/* Word Families Chips */}
               {result.wordFamilies && result.wordFamilies.length > 0 && (
                 <div className="relative z-10 mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Word Families</span>
                    {result.wordFamilies.map(fam => (
                      <button 
                        key={fam}
                        onClick={() => handleChipClick(fam)}
                        className="px-3 py-1 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-800 text-gray-700 text-sm font-medium rounded-full cursor-pointer transition-colors flex items-center gap-1 group"
                      >
                        {fam} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" />
                      </button>
                    ))}
                 </div>
               )}
            </Card>

            {/* Layout for AI Features + Senses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Definitions Mapping (Takes up more space) */}
              <div className="md:col-span-2 space-y-6">
                {result.meanings.map((meaning, mIdx) => (
                  <Card key={mIdx} className="p-6 md:p-8 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6 relative">
                      <h3 className="text-lg font-black text-indigo-800 italic uppercase tracking-wider bg-indigo-50 px-4 py-1 rounded-lg inline-block">
                        {meaning.partOfSpeech}
                      </h3>
                      <div className="h-px bg-gray-100 flex-1"></div>
                    </div>

                    <ol className="space-y-8 list-none">
                      {meaning.definitions.map((def, dIdx) => (
                        <li key={dIdx} className="relative pl-6 md:pl-8">
                          {/* Number Indicator */}
                          <span className="absolute left-0 top-0 text-sm font-black text-gray-300 select-none">
                            {dIdx + 1}.
                          </span>
                          
                          <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2">
                            {def.definition}
                          </p>

                          {def.example && (
                            <div className="mt-3 p-4 bg-gray-50 border-l-4 border-l-amber-400 rounded-r-lg text-gray-600 italic">
                                "{def.example}"
                            </div>
                          )}

                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Synonyms:</span>
                              {def.synonyms.map(syn => (
                                <button 
                                  key={syn} 
                                  onClick={() => handleChipClick(syn)}
                                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                >
                                  {syn}
                                </button>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>

                    {meaning.synonyms && meaning.synonyms.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2 items-center bg-gray-50 p-4 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-full mb-1">General Synonyms</span>
                        {meaning.synonyms.slice(0, 10).map((syn, sIdx) => (
                           <button 
                             key={sIdx} 
                             onClick={() => handleChipClick(syn)}
                             className="px-3 py-1 bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-700 text-gray-600 rounded-lg text-sm font-medium transition-all shadow-sm"
                           >
                             {syn}
                           </button>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* AI Features Rail (Takes remaining space) */}
              <div className="space-y-6">
                
                {/* AI Etymology */}
                <Card className="p-6 bg-gradient-to-br from-indigo-900 to-indigo-800 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-indigo-500 opacity-20">
                     <Clock size={80} />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Clock size={16} /> Etymology & History
                    </h4>
                    <p className="text-indigo-50 leading-relaxed font-medium text-sm">
                      {result.aiEtymology || "Historical roots data currently unavailable."}
                    </p>
                  </div>
                </Card>

                {/* AI Usage Notes (Only show if AI generated one) */}
                {result.aiUsageNote && (
                  <Card className="p-6 bg-rose-50 border-l-4 border-l-rose-500 shadow-sm relative overflow-hidden">
                    <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertCircle size={16} /> Usage Note
                    </h4>
                    <p className="text-rose-900 leading-relaxed text-sm font-medium italic">
                      {result.aiUsageNote}
                    </p>
                  </Card>
                )}
                
              </div>
            </div>
            
          </div>
        )}

        {/* Empty State when zero search length */}
        {!isLoading && !result && !error && history.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
             <BookOpen size={64} className="text-indigo-200 mb-6" />
             <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to expand your vocabulary?</h3>
             <p className="text-gray-500 text-center max-w-sm">Search for any English word above to view its detailed AI-enhanced definition.</p>
          </div>
        )}

      </div>

      {/* History Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={16} /> Recent Lookups
          </h3>
          
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl">No recent words.</p>
          ) : (
            <div className="space-y-2">
              {history.map((word, idx) => (
                <button
                  key={idx + word}
                  onClick={() => handleChipClick(word)}
                  className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-gray-100 hover:border-indigo-100 rounded-xl text-sm font-bold text-gray-700 hover:text-indigo-800 transition-all shadow-sm flex items-center justify-between group"
                >
                  <span className="capitalize">{word}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-indigo-400 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AIDictionary;
