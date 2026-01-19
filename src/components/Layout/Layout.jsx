import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  CheckSquare, 
  PenTool, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  User,
  Presentation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Button from '../UI/Button';

const SidebarItem = ({ icon: Icon, label, path, isCollapsed, isActive }) => {
  return (
    <Link 
      to={path}
      title={isCollapsed ? label : ''}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group relative",
        isActive 
          ? "bg-[hsl(var(--color-primary))/10] text-[hsl(var(--color-primary))]" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon size={20} className={clsx("transition-colors", isActive ? "text-[hsl(var(--color-primary))]" : "text-gray-500 group-hover:text-gray-700")} />
      {!isCollapsed && (
        <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
          {label}
        </span>
      )}
      {isCollapsed && isActive && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: FileText, label: 'Summarizer', path: '/student/summarizer' },
    { icon: Layers, label: 'Flashcards', path: '/student/flashcards' },
    { icon: CheckSquare, label: 'MCQ Practice', path: '/student/mcq' },
    { icon: PenTool, label: 'Exam Attempt', path: '/student/exam' },
  ];

  const teacherLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: Presentation, label: 'Slide Generator', path: '/teacher/slides' },
    { icon: PenTool, label: 'Exam Creator', path: '/teacher/exam-generator' },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[hsl(var(--color-bg))] overflow-hidden">
      
      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 72 : 260 }}
        className="hidden md:flex flex-col bg-white border-r border-[hsl(var(--color-border))] h-full z-20 shadow-sm relative transition-all duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--color-border))] justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
             <img src="/logo.png" alt="Logo" className="w-8 h-8 flex-shrink-0" />
             {!isCollapsed && (
               <span className="font-bold text-xl tracking-tight text-[hsl(var(--color-text-main))]">
                 QueryQuill
               </span>
             )}
          </div>
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md z-30 text-gray-400 hover:text-[hsl(var(--color-primary))]"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Links */}
        <div className="flex-1 py-6 px-3 overflow-y-auto scrollbar-none">
          <div className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {!isCollapsed ? 'Menu' : '—'}
          </div>
          {links.map(link => (
            <SidebarItem 
              key={link.path}
              {...link}
              isCollapsed={isCollapsed}
              isActive={location.pathname === link.path}
            />
          ))}

          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
             {!isCollapsed ? 'Settings' : '—'}
          </div>
          <SidebarItem 
            icon={User} 
            label="Profile" 
            path="/profile" 
            isCollapsed={isCollapsed}
            isActive={location.pathname === '/profile'}
          />
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-[hsl(var(--color-border))]">
          <button 
            onClick={handleLogout}
            className={clsx(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors",
              isCollapsed && "justify-center"
            )}
            title="Sign Out"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-[hsl(var(--color-border))]">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                  <span className="font-bold text-lg">QueryQuill</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3">
                {links.map(link => (
                  <SidebarItem 
                    key={link.path}
                    {...link}
                    isCollapsed={false}
                    isActive={location.pathname === link.path}
                  />
                ))}
                 <div className="my-4 border-t border-gray-100" />
                 <SidebarItem 
                   icon={User} 
                   label="Profile" 
                   path="/profile" 
                   isCollapsed={false}
                   isActive={location.pathname === '/profile'}
                 />
              </div>

               <div className="p-4 border-t border-[hsl(var(--color-border))]">
                <Button variant="outline" onClick={handleLogout} className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  <LogOut size={16} className="mr-2" /> Sign Out
                </Button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[hsl(var(--color-border))] z-30">
          <div className="flex items-center gap-2">
             <img src="/logo.png" alt="Logo" className="w-8 h-8" />
             <span className="font-bold text-lg text-[hsl(var(--color-primary))]">QueryQuill</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
