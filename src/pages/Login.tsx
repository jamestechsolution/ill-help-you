import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, Rocket, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface LoginProps {
  onLogin: (role: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (pError) throw pError;
      
      onLogin(profile.role);
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    setIsLoading(true);
    toast.info(`Setting up demo credentials for ${role.replace('_', ' ')}...`);
    
    setTimeout(() => {
      onLogin(role);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 -left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-6xl min-h-[600px] h-auto max-h-[90vh] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white z-10"
      >
        <div className="hidden lg:block w-[55%] relative">
          <img 
            src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/06b7a1d9-8d65-47ad-9504-cfe2a8e6768a/login-hero-new-87d04dc2-1777383384126.webp" 
            alt="Modern Academy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-between p-16 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter">EduFlow.</span>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full text-[10px] font-black border bg-white/10 text-white border-white/20 tracking-widest uppercase">Version 2.5</div>
                  <span className="h-px w-12 bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Enterprise Grade</span>
                </div>
                <h2 className="text-6xl font-black mb-6 leading-[1.05] tracking-tighter">
                  The Future of <br /> <span className="text-primary">Academy</span> Management
                </h2>
                <p className="text-xl opacity-70 font-medium max-w-md leading-relaxed">
                  Experience the most intuitive, data-driven platform designed for modern educational institutions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] p-8 md:p-16 flex flex-col justify-center bg-white overflow-y-auto no-scrollbar">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1.5 w-10 bg-primary rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Login</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Welcome Back.</h3>
            <p className="text-slate-500 font-medium text-lg">Access your administrative dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@school.edu" 
                  className="pl-14 h-14 rounded-[1.25rem] bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base font-bold text-slate-900"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-14 pr-14 h-14 rounded-[1.25rem] bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base font-bold text-slate-900"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-[1.25rem] text-lg font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95"
            >
              {isLoading ? "Authenticating..." : "Enter Dashboard"}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Access</p>
            <div className="grid grid-cols-2 gap-3">
              {[ 
                { role: 'school_admin', icon: UserCheck, label: 'Admin' },
                { role: 'teacher', icon: GraduationCap, label: 'Teacher' }
              ].map((demo) => (
                <Button 
                  key={demo.role}
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                  className="h-12 rounded-xl border-2 font-bold hover:bg-slate-50"
                  onClick={() => handleDemoLogin(demo.role)}
                >
                  <demo.icon className="h-4 w-4 mr-2 text-primary" /> {demo.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}