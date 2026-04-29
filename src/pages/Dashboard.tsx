import React from 'react';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  Zap,
  Activity,
  Trophy
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Jan', revenue: 4000, students: 240 },
  { name: 'Feb', revenue: 3000, students: 300 },
  { name: 'Mar', revenue: 5000, students: 280 },
  { name: 'Apr', revenue: 2780, students: 390 },
  { name: 'May', revenue: 4890, students: 480 },
  { name: 'Jun', revenue: 6390, students: 580 },
];

const stats = [
  { label: 'Total Scholars', value: '1,284', icon: Users, change: '+12.5%', positive: true, trend: [10, 20, 15, 30, 25, 40] },
  { label: 'Avg. Attendance', value: '94.2%', icon: Calendar, change: '+2.1%', positive: true, trend: [30, 25, 35, 30, 40, 38] },
  { label: 'Net Revenue', value: '$45,200', icon: CreditCard, change: '-4.3%', positive: false, trend: [40, 30, 25, 20, 15, 10] },
  { label: 'Success Rate', value: '88.5%', icon: Award, change: '+5.4%', positive: true, trend: [20, 25, 30, 35, 40, 45] },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-none font-black text-[11px] tracking-[0.2em] uppercase py-1.5 px-4 rounded-xl">
              Academic Cycle 2024
            </Badge>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Good Morning, <span className="text-gradient">Administrator</span>
          </h1>
          <p className="text-slate-500 font-bold text-xl">Your school ecosystem is performing 15% above target today.</p>
        </div>
        <div className="flex items-center gap-5">
          <Button variant="outline" className="h-14 rounded-3xl border-2 font-black px-8 bg-white hover:bg-slate-50 text-slate-900 shadow-sm transition-all">
            System Logs
          </Button>
          <Button className="h-14 rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-8 transition-all hover:scale-105 active:scale-95">
            <Zap className="h-5 w-5 mr-3 fill-current" />
            Execute Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="glass-card group hover:-translate-y-3 transition-all duration-700 border-none rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className={cn(
                    "p-5 rounded-[1.75rem] transition-all duration-700",
                    stat.positive ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white shadow-xl shadow-emerald-500/10" : "bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white shadow-xl shadow-rose-500/10"
                  )}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[12px] font-black px-3 py-1.5 rounded-2xl",
                    stat.positive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  )}>
                    {stat.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                </div>
                
                <div className="mt-8 flex items-end gap-1.5 h-12">
                  {stat.trend.map((val, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                      className={cn(
                        "flex-1 rounded-t-lg transition-all duration-500",
                        stat.positive ? "bg-emerald-500/20 group-hover:bg-emerald-500/40" : "bg-rose-500/20 group-hover:bg-rose-500/40",
                        i >= stat.trend.length - 2 && (stat.positive ? "bg-emerald-500" : "bg-rose-500")
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
        {/* Revenue Chart */}
        <motion.div variants={item} className="lg:col-span-8">
          <Card className="glass-card border-none overflow-hidden h-full rounded-[3rem] p-4">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-10">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight text-slate-900">Financial Pulse</CardTitle>
                <CardDescription className="font-bold text-slate-500">Real-time revenue & student growth projection</CardDescription>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/20" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                </div>
                <Button variant="secondary" className="h-12 rounded-[1.25rem] bg-slate-100 text-[11px] font-black uppercase tracking-widest px-6">Semi-Annual View</Button>
              </div>
            </CardHeader>
            <CardContent className="h-[450px] px-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'oklch(0.45 0.05 240)', fontSize: 13, fontWeight: 900 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'oklch(0.45 0.05 240)', fontSize: 13, fontWeight: 900 }}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'oklch(0.55 0.22 260)', strokeWidth: 3, strokeDasharray: '8 8' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(16px)',
                      border: 'none', 
                      borderRadius: '24px', 
                      padding: '20px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="oklch(0.55 0.22 260)" 
                    strokeWidth={6}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    animationDuration={3000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights Section */}
        <motion.div variants={item} className="lg:col-span-4 space-y-10">
           <Card className="border-none bg-slate-900 text-white overflow-hidden relative group h-[48%] rounded-[3rem] p-6 shadow-3xl">
            <Activity className="absolute -right-10 -top-10 h-48 w-48 text-primary/20 rotate-12 group-hover:scale-125 transition-all duration-1000" />
            <CardHeader className="relative z-10 space-y-2">
              <CardTitle className="text-3xl font-black tracking-tight">Enrollment Target</CardTitle>
              <CardDescription className="text-slate-400 font-bold italic text-base">85% Achievement Level</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 mt-6">
              <div className="h-5 w-full bg-white/10 rounded-full overflow-hidden mb-8 border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  className="h-full bg-primary shadow-[0_0_20px_rgba(99,102,241,0.8)]"
                />
              </div>
              <Button variant="secondary" className="w-full h-14 rounded-3xl bg-white text-slate-900 hover:bg-slate-100 font-black shadow-2xl transition-all">
                Adjust Milestones
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-none rounded-[3rem] h-[48%] p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900">Weekly Quota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {[ 
                { label: 'Grade 12 Compliance', val: 98, color: 'bg-emerald-500' },
                { label: 'Financial Arrears', val: 64, color: 'bg-amber-500' },
                { label: 'Scholarship Apps', val: 42, color: 'bg-primary' }
              ].map((goal, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-400 uppercase tracking-widest">{goal.label}</span>
                    <span className="text-slate-900 font-black">{goal.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.val}%` }}
                      className={cn("h-full rounded-full", goal.color)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
        {/* Live Activity Feed */}
        <motion.div variants={item} className="lg:col-span-7">
          <Card className="glass-card border-none rounded-[3.5rem] overflow-hidden">
            <CardHeader className="p-10 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-900">Institutional Pulse</CardTitle>
                <CardDescription className="font-bold">Live stream of campus operations</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary hover:bg-primary/5 font-black uppercase tracking-[0.2em] text-[11px] px-6">Archive</Button>
            </CardHeader>
            <CardContent className="px-10 pb-12 pt-0">
              <div className="space-y-10">
                {[
                  { user: 'Sarah Jenkins', action: 'processed enrollment', target: 'Grade 10-A', time: '2 mins ago', icon: Users, color: 'text-primary bg-primary/10' },
                  { user: 'Mark Wilson', action: 'settled arrears for', target: 'Invoice #8291', time: '45 mins ago', icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10' },
                  { user: 'System Protocol', action: 'compiled', target: 'Attendance Audit', time: '2 hours ago', icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
                  { user: 'Director Office', action: 'announced', target: 'Gala Night 2024', time: '5 hours ago', icon: Award, color: 'text-rose-500 bg-rose-500/10' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-8 group cursor-pointer">
                    <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-xl", act.color)}>
                      <act.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-900 leading-tight">
                        {act.user} <span className="text-slate-400 font-medium">{act.action}</span> {act.target}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{act.time}</p>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-slate-50 shadow-sm">
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Highlight Card */}
        <motion.div variants={item} className="lg:col-span-5">
          <Card className="glass-card border-none overflow-hidden relative h-full flex flex-col rounded-[3.5rem]">
            <div className="h-56 relative group">
               <img 
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/06b7a1d9-8d65-47ad-9504-cfe2a8e6768a/login-hero-990f740a-1777383745389.webp" 
                className="absolute inset-0 object-cover w-full h-full grayscale-[0.2] brightness-90 group-hover:scale-110 transition-transform duration-2000"
                alt="Events"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <Badge className="bg-primary text-white border-none px-4 py-1.5 font-black text-[11px] tracking-widest uppercase mb-3 shadow-2xl rounded-xl">Major Highlight</Badge>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Annual Innovation Fair</h3>
              </div>
            </div>
            <CardContent className="p-10 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 rounded-[2rem] bg-slate-50/80 border border-white transition-all hover:shadow-xl">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[11px] font-black text-slate-400 uppercase leading-none mb-1">Oct</span>
                    <span className="text-2xl font-black text-primary leading-none">15</span>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none">Protocol Launch</p>
                    <p className="text-sm text-slate-500 font-bold mt-2">09:00 AM \u2022 Innovation Hub</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 p-6 rounded-[2rem] bg-slate-50/80 border border-white transition-all hover:shadow-xl">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[11px] font-black text-slate-400 uppercase leading-none mb-1">Oct</span>
                    <span className="text-2xl font-black text-slate-900 leading-none">20</span>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none">Technical Audits</p>
                    <p className="text-sm text-slate-500 font-bold mt-2">08:30 AM \u2022 Central Labs</p>
                  </div>
                </div>
              </div>
              <Button className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-black shadow-3xl mt-10 transition-all active:scale-95">
                <Trophy className="h-5 w-5 mr-3" /> View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}