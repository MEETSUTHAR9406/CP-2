import React from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { User, Shield, LogOut, Bell, Moon, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* User Info Card */}
        <Card className="p-8 mb-8 relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
           <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
           
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white text-indigo-600 flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-indigo-200/30">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-indigo-100 opacity-90">{user?.email}</p>
                <div className="flex items-center gap-3 mt-3">
                   <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                     <Shield size={12} /> {user?.role}
                   </span>
                   <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide">
                     Free Plan
                   </span>
                </div>
              </div>
           </div>
        </Card>

        {/* Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
             <SettingsIcon size={18} className="text-gray-400" />
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Account Settings</h3>
          </div>

          <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="divide-y divide-gray-100">
              <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-white group-hover:text-[hsl(var(--color-primary))] transition-colors shadow-sm"><User size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-900">Personal Information</div>
                    <div className="text-xs text-gray-500">Update your name and contact details</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-white group-hover:text-[hsl(var(--color-primary))] transition-colors shadow-sm"><Bell size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-900">Notifications</div>
                    <div className="text-xs text-gray-500">Manage email and push alerts</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Configure</Button>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-white group-hover:text-[hsl(var(--color-primary))] transition-colors shadow-sm"><Moon size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-900">Appearance</div>
                    <div className="text-xs text-gray-500">Switch to dark mode</div>
                  </div>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-not-allowed">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10">
          <button 
            onClick={logout} 
            className="w-full py-4 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Sign Out
          </button>
          <div className="text-center mt-4 text-xs text-gray-400">
            Version 1.0.0 • © 2026 QueryQuill
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
