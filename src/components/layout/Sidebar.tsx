import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  GraduationCap, 
  CalendarCheck, 
  CreditCard, 
  FileText, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Admin', icon: UserCog },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'teachers', label: 'Teachers', icon: UserSquare2 },
  { id: 'classes', label: 'Classes', icon: GraduationCap },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'finance', label: 'Billing & Finance', icon: CreditCard },
  { id: 'exams', label: 'Exams & Results', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }: SidebarProps) {
  const handleUpgrade = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Initiating upgrade sequence...',
        success: 'Elite Plan trial activated! Enjoy AI analytics.',
        error: 'Upgrade failed',
      }
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-50 h-screen glass-dark transition-all duration-700 ease-[0.16,1,0.3,1] shadow-3xl",
        collapsed ? "w-24" : "w-72"
      )}
    >
      {/* Brand Section */}
      <div className="relative flex h-24 items-center justify-between px-6 mb-4">
        <motion.div 
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -20 : 0 }}
          className={cn("flex items-center gap-4", collapsed && "hidden")}
        >
          <div className="h-12 w-12 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-6 group">
            <GraduationCap className="h-7 w-7 text-white transition-transform group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-white leading-none">EduFlow<span className="text-primary">.</span></span>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mt-1">Academy OS</span>
          </div>
        </motion.div>
        
        {collapsed && (
          <div className="mx-auto h-12 w-12 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 group cursor-pointer">
            <GraduationCap className="h-7 w-7 text-white transition-transform group-hover:scale-110" />
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-10 h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90 hover:text-white shadow-2xl md:flex hidden z-50 transition-all active:scale-90"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2 mt-6 overflow-y-auto max-h-[calc(100vh-320px)] no-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative",
                isActive 
                  ? "bg-primary text-white glow-active" 
                  : "text-white/50 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0 h-16"
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 shrink-0 transition-all duration-500 group-hover:scale-110",
                isActive ? "text-white" : "text-white/30 group-hover:text-white"
              )} />
              {!collapsed && (
                <span className="font-bold text-[15px] tracking-tight">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute right-4 h-2 w-2 rounded-full bg-white" 
                />
              )}
              {isActive && collapsed && (
                <motion.div 
                  layoutId="active-indicator-collapsed"
                  className="absolute right-1.5 h-10 w-1.5 rounded-full bg-primary shadow-[0_0_10px_#6366f1]" 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-10 w-full px-5 space-y-6">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/30 to-indigo-900/40 border border-white/10 relative overflow-hidden group shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Elite Plan</p>
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-medium mb-5">Harness AI-driven predictive analytics for student success.</p>
              <button 
                onClick={handleUpgrade}
                className="w-full py-3 bg-white text-slate-900 text-xs font-black rounded-2xl hover:bg-white/90 transition-all shadow-2xl active:scale-95"
              >
                Upgrade Access
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/40 transition-colors" />
          </motion.div>
        )}

        <button
          onClick={() => {
            toast.info("System termination initiated...");
            setTimeout(onLogout, 1000);
          }}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-black text-sm uppercase tracking-widest",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-6 w-6 shrink-0" />
          {!collapsed && <span>System Exit</span>}
        </button>
      </div>
    </aside>
  );
}