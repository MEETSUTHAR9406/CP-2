import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStats } from '../../context/StatsContext';
import Card from '../../components/UI/Card';
import { Trophy, Flame, Target, ArrowUpRight, Medal, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/UI/Button';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color.text}`}>
      <Icon size={60} />
    </div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className={`inline-flex p-2 rounded-lg mb-4 ${color.bg} ${color.text} bg-opacity-20`}>
          <Icon size={22} />
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1 break-words">{title}</h3>
        <div className="text-3xl font-bold text-gray-900 break-words">{value}</div>
      </div>
      {subtitle && (
        <div className="mt-2 flex items-center text-xs text-gray-400 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  </motion.div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const { stats } = useStats();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
        <div className="w-full md:w-auto min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 break-words">Hello, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="text-gray-500 mt-1 break-words">Ready to learn something new today?</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
           <Link to="/student/summarizer" className="flex-1 sm:flex-none">
             <Button variant="outline" size="sm" className="w-full justify-center">
               <BookOpen size={16} className="mr-2" /> Quick Summary
             </Button>
           </Link>
           <Link to="/student/mcq" className="flex-1 sm:flex-none">
             <Button size="sm" className="w-full justify-center">
               <Target size={16} className="mr-2" /> Start Practice
             </Button>
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Daily Streak" 
          value={`${stats?.streak || 0}`}
          subtitle="Keep it up!"
          icon={Flame} 
          color={{ bg: 'bg-orange-100', text: 'text-orange-500' }} 
          delay={0}
        />
        <StatCard 
          title="Total XP" 
          value={`${stats?.xp || 0}`} 
          subtitle="Lifetime earned"
          icon={Trophy} 
          color={{ bg: 'bg-yellow-100', text: 'text-yellow-600' }} 
          delay={0.1}
        />
        <StatCard 
          title="Quizzes Taken" 
          value={Math.max(0, Math.floor((stats?.xp || 0) / 50))} 
          subtitle="Practice sessions"
          icon={Target} 
          color={{ bg: 'bg-blue-100', text: 'text-blue-500' }} 
          delay={0.2}
        />
        <StatCard 
          title="Study Hours" 
          value="12.5" 
          subtitle="This week"
          icon={Clock} 
          color={{ bg: 'bg-purple-100', text: 'text-purple-500' }} 
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity / Recommendations (Main Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
            <Link to="/student/mcq" className="text-sm text-[hsl(var(--color-primary))] font-medium hover:underline flex items-center">
              View All <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:border-[hsl(var(--color-primary))] cursor-pointer transition-colors group text-center p-6">
               <div className="h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg mb-4 flex items-center justify-center mx-auto w-24">
                  <BookOpen size={32} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
               </div>
               <h3 className="font-bold text-lg mb-1 text-gray-900">React Fundamentals</h3>
               <p className="text-sm text-gray-600 mb-4 font-medium">Chapter 3 • Components & Props</p>
               <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-indigo-500 w-3/4 h-full" />
               </div>
            </Card>

            <Card className="hover:border-[hsl(var(--color-primary))] cursor-pointer transition-colors group text-center p-6">
               <div className="h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg mb-4 flex items-center justify-center mx-auto w-24">
                  <Target size={32} className="text-emerald-400 group-hover:text-emerald-600 transition-colors" />
               </div>
               <h3 className="font-bold text-lg mb-1 text-gray-900">Weekly Quiz</h3>
               <p className="text-sm text-gray-600 mb-4 font-medium">Due Tomorrow • 15 Questions</p>
               <Button size="sm" variant="outline" className="w-full border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">Resume Quiz</Button>
            </Card>
          </div>
        </div>

        {/* Badges / Side Column */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
           <Card className="p-0 overflow-hidden border-none shadow-sm ring-1 ring-gray-900/5">
             <div className="divide-y divide-gray-100">
                {stats?.badges?.length > 0 ? (
                  stats.badges.map((badge, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                         <Medal size={20} />
                       </div>
                       <div>
                         <div className="font-bold text-gray-900 text-sm">{badge}</div>
                         <div className="text-xs text-gray-500">Earned on Jan 19</div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Medal size={24} />
                    </div>
                    <p className="text-gray-500 text-sm">Complete quizzes to earn your first badge!</p>
                  </div>
                )}
             </div>
             <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                <button className="text-xs font-bold text-[hsl(var(--color-primary))] uppercase tracking-wide hover:underline">View All Badges</button>
             </div>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
