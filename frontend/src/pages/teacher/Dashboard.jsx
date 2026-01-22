import React, { useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Users, FileText, Download, TrendingUp, Plus, Search, MoreHorizontal, BookOpen, Presentation, PenTool, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      
      {/* Welcome Section (Matching Student Style) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
        <div className="w-full md:w-auto min-w-0">
           <h1 className="text-3xl font-bold text-gray-900 break-words">Welcome, {user?.name?.split(' ')[0] || 'Teacher'}! 👨‍🏫</h1>
           <p className="text-gray-500 mt-1 break-words">Manage your classroom, create content, and track progress.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <Link to="/teacher/exam-generator" className="w-full sm:w-auto">
            <Button className="pl-4 pr-6 shadow-lg shadow-indigo-100 w-full sm:w-auto justify-center">
               <Plus size={20} className="mr-2" /> New Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid (Student-like but relevant data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm hover:translate-y-1 transition-all">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg flex-shrink-0"><Users size={24} /></div>
             <span className="text-sm font-bold text-gray-500 break-words">Total Students</span>
           </div>
           <div className="text-3xl font-bold text-gray-900">48</div>
           <div className="text-xs text-green-600 font-bold mt-1">+12% from last month</div>
        </Card>

        <Card className="p-6 border-none shadow-sm hover:translate-y-1 transition-all">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-2 bg-teal-100 text-teal-600 rounded-lg flex-shrink-0"><FileText size={24} /></div>
             <span className="text-sm font-bold text-gray-500 break-words">Active Exams</span>
           </div>
           <div className="text-3xl font-bold text-gray-900">3</div>
           <div className="text-xs text-gray-400 mt-1">Next due: Friday</div>
        </Card>

        <Card className="p-6 border-none shadow-sm hover:translate-y-1 transition-all">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg flex-shrink-0"><TrendingUp size={24} /></div>
             <span className="text-sm font-bold text-gray-500 break-words">Avg. Score</span>
           </div>
           <div className="text-3xl font-bold text-gray-900">85%</div>
           <div className="text-xs text-green-600 font-bold mt-1">Top 5% of region</div>
        </Card>

        <Card className="p-6 border-none shadow-sm hover:translate-y-1 transition-all">
           <div className="flex items-center gap-4 mb-2">
             <div className="p-2 bg-purple-100 text-purple-600 rounded-lg flex-shrink-0"><Presentation size={24} /></div>
             <span className="text-sm font-bold text-gray-500 break-words">Slides Created</span>
           </div>
           <div className="text-3xl font-bold text-gray-900">14</div>
           <div className="text-xs text-gray-400 mt-1">Last: React Hooks</div>
        </Card>
      </div>

      {/* Exclusive Tools Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-[hsl(var(--color-primary))]" /> 
          Exclusive Teacher Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Link to="/teacher/exam-generator" className="group">
             <Card className="p-8 h-full border-2 border-transparent hover:border-[hsl(var(--color-primary))] hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-[hsl(var(--color-primary))] rounded-bl-full opacity-5 group-hover:scale-110 transition-transform" />
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white transition-colors">
                 <PenTool size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">AI Exam Generator</h3>
               <p className="text-gray-500 mb-4">Create comprehensive exams from PDF notes in seconds. Auto-generate MCQs, short, and long questions.</p>
               <span className="text-[hsl(var(--color-primary))] font-bold text-sm flex items-center">
                 Create Exam <Plus size={16} className="ml-1" />
               </span>
             </Card>
           </Link>

           <Link to="/teacher/slides" className="group">
             <Card className="p-8 h-full border-2 border-transparent hover:border-[hsl(var(--color-secondary))] hover:bg-teal-50/30 transition-all cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-[hsl(var(--color-secondary))] rounded-bl-full opacity-5 group-hover:scale-110 transition-transform" />
               <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[hsl(var(--color-secondary))] group-hover:text-white transition-colors">
                 <Presentation size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">PDF to Slides</h3>
               <p className="text-gray-500 mb-4">Convert lecture notes into beautiful, presentation-ready slide decks automatically.</p>
               <span className="text-[hsl(var(--color-secondary))] font-bold text-sm flex items-center">
                 Generate Slides <Plus size={16} className="ml-1" />
               </span>
             </Card>
           </Link>
        </div>
      </div>

      {/* Recent Activity Table (Same as before) */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 max-w-full">
             <LayoutDashboard size={20} className="text-gray-400 flex-shrink-0" />
             <h2 className="text-lg font-bold text-gray-900 break-words truncate">Recent Exam Papers</h2>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto hidden xl:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Topic / ID</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submission</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3].map((item) => (
                <tr key={item} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">Introduction to React Patterns</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">ID: EX-2025-00{item}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">Jan 1{8+item}, 2026</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">24/48 Students</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-[hsl(var(--color-primary))] hover:bg-indigo-50 rounded-lg transition-colors" title="Download Results">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="xl:hidden">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 border-b border-gray-100 last:border-b-0 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Introduction to React Patterns</h3>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">ID: EX-2025-00{item}</div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Created</span>
                  <span>Jan 1{8+item}, 2026</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-gray-400 uppercase tracking-wider">Submissions</span>
                   <span>24/48 Students</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-[hsl(var(--color-primary))] bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Download size={16} /> Results
                </button>
                <button className="p-2 text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-sm font-medium text-[hsl(var(--color-primary))] hover:underline">View All Exams</button>
        </div>
      </Card>

    </div>
  );
};

export default TeacherDashboard;
