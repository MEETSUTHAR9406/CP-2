import React, { useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Users, FileText, Download, TrendingUp, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
           <p className="text-gray-500 mt-1">Manage your classroom, exams, and content.</p>
        </div>
        <Link to="/teacher/exam-generator">
          <Button className="pl-4 pr-6 shadow-lg shadow-indigo-100">
             <Plus size={20} className="mr-2" /> Create New Exam
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none shadow-xl shadow-blue-200">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><FileText size={24} /></div>
             <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">+2 this week</span>
           </div>
           <div className="text-4xl font-bold mb-1">12</div>
           <div className="text-indigo-100 text-sm font-medium">Active Exams</div>
        </Card>

        <Card className="p-6 border-none shadow-md hover:shadow-lg transition-shadow">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Users size={24} /></div>
           </div>
           <div className="text-4xl font-bold text-gray-900 mb-1">48</div>
           <div className="text-gray-500 text-sm font-medium">Enrolled Students</div>
        </Card>

        <Card className="p-6 border-none shadow-md hover:shadow-lg transition-shadow">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><TrendingUp size={24} /></div>
           </div>
           <div className="text-4xl font-bold text-gray-900 mb-1">85%</div>
           <div className="text-gray-500 text-sm font-medium">Average Class Score</div>
        </Card>
      </div>

      {/* Recent Exams Table */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Exam Papers</h2>
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
        
        <div className="overflow-x-auto">
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
        
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-sm font-medium text-[hsl(var(--color-primary))] hover:underline">View All Exams</button>
        </div>
      </Card>

    </div>
  );
};

export default TeacherDashboard;
