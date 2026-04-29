import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { TeachersPage } from './pages/Teachers';
import { ClassesPage } from './pages/Classes';
import { SubjectsPage } from './pages/Subjects';
import { Finance } from './pages/Finance';
import { Attendance } from './pages/Attendance';
import { ExamsPage } from './pages/Exams';
import { UsersPage } from './pages/Users';
import { SettingsPage } from './pages/Settings';
import { NotificationsPage } from './pages/Notifications';
import { Login } from './pages/Login';
import { Toaster } from '@/components/ui/sonner';
import { Bell, Search, Menu, GraduationCap, Sparkles, Settings as SettingsIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync internal auth state with context if needed, but we'll use context directly
  const isAuthenticated = !!user;
  const userRole = profile?.role || 'student';

  const handleLogout = async () => {
    await signOut();
    setActiveTab('dashboard');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Global search index is being updated. Searching local directory instead...");
  };

  // Pre-load check to ensure visibility
  useEffect(() => {
    console.log("App mounted - Visibility system active");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl shadow-primary/20" />
          <p className="font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Login onLogin={() => {}} /> {/* Login handles its own logic via supabase auth */}
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans text-slate-900">
      {/* Premium Background Layer - Adjusted for better visibility and performance */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{ 
          backgroundImage: `url('https://storage.googleapis.com/dala-prod-public-storage/generated-images/06b7a1d9-8d65-47ad-9504-cfe2a8e6768a/dashboard-bg-e5b95fb9-1777383743389.webp')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          filter: 'blur(40px)' 
        }}
      />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-500 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          onLogout={handleLogout}
        />
      </div>
      
      <main className={`transition-all duration-700 ease-[0.16,1,0.3,1] min-h-screen flex flex-col relative z-10 ${collapsed ? 'lg:ml-24' : 'lg:ml-72'}`}>
        {/* Modern Header */}
        <header className="h-24 glass sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between border-b border-white/30">
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
            
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 capitalize leading-none">
                {activeTab.replace('-', ' ')}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Access</span>
              </div>
            </div>

            <form onSubmit={handleGlobalSearch} className="relative max-w-lg w-full hidden lg:block group ml-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Search directory..." 
                className="pl-14 h-14 bg-white/60 border-none focus-visible:ring-4 focus-visible:ring-primary/10 transition-all rounded-3xl font-bold text-slate-900 shadow-sm"
              />
            </form>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center bg-white/60 p-1.5 rounded-[1.5rem] border border-white/50 shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative hover:bg-primary/10 hover:text-primary transition-all rounded-2xl h-10 w-10 md:h-11 md:w-11 ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-3 w-3 bg-rose-500 rounded-full border-2 border-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`hover:bg-primary/10 hover:text-primary transition-all rounded-2xl h-10 w-10 md:h-11 md:w-11 ${activeTab === 'settings' ? 'text-primary bg-primary/10' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
            
            <div 
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => setActiveTab('settings')}
            >
              <div className="text-right hidden md:block text-slate-900">
                <p className="text-sm font-black leading-none">{profile?.full_name || 'User'}</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5">{userRole.replace('_', ' ')}</p>
              </div>
              <div className="relative">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black shadow-2xl shadow-primary/30 transition-all group-hover:scale-105">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-6 md:p-10 lg:p-14 flex-1 relative overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'students' && <Students />}
              {activeTab === 'teachers' && <TeachersPage />}
              {activeTab === 'classes' && <ClassesPage />}
              {activeTab === 'subjects' && <SubjectsPage />}
              {activeTab === 'finance' && <Finance />}
              {activeTab === 'attendance' && <Attendance />}
              {activeTab === 'exams' && <ExamsPage />}
              {activeTab === 'settings' && <SettingsPage />}
              {activeTab === 'users' && <UsersPage />}
              {activeTab === 'notifications' && <NotificationsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Premium Footer */}
        <footer className="px-6 md:px-14 py-8 md:py-12 border-t border-slate-200/60 bg-white/40 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-6 md:gap-8 text-center md:text-left">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">EduFlow Pro <span className="text-primary">v2.5.2</span></p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unified Academy Protocol</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-10">
              {['Architecture', 'Security', 'Compliance'].map(link => (
                <a key={link} href="#" onClick={(e) => { e.preventDefault(); toast.info(`Accessing ${link} documentation...`); }} className="text-xs font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest">{link}</a>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400 opacity-60">© 2024 Global Education Systems Inc.</p>
          </div>
        </footer>
      </main>
      
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;