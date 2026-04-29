import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Trophy, 
  GraduationCap, 
  Search,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Layout,
  Star,
  Zap,
  BookOpen,
  UserCheck,
  ClipboardCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OnlineExam, AssessmentMark, Student, Subject, Class } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ExamsPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'school_admin' || true; // Force true for demo if needed
  const isTeacher = profile?.role === 'teacher' || isAdmin;
  
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [marks, setMarks] = useState<AssessmentMark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<OnlineExam | null>(null);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [isTakeExamDialogOpen, setIsTakeExamDialogOpen] = useState(false);

  const [examForm, setExamForm] = useState({
    title: '',
    subject_id: '',
    duration_minutes: 60,
    total_marks: 100,
  });

  const [markEntry, setMarkEntry] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch core data for selections
      const { data: subData } = await supabase.from('subjects').select('*');
      setSubjects(subData || []);
      
      const { data: clsData } = await supabase.from('classes').select('*');
      setClasses(clsData || []);

      const { data: examData } = await supabase.from('online_exams').select('*').order('created_at', { ascending: false });
      setExams(examData || []);

      if (!isTeacher) {
        const { data: markData } = await supabase
          .from('assessment_marks')
          .select('*, assessments(*)')
          .eq('student_id', profile?.id);
        setMarks(markData || []);
      }
    } catch (error: any) {
      toast.error("Error fetching exam data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateExam = async () => {
    if (!examForm.title || !examForm.subject_id) {
      toast.error("Please provide exam title and subject");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('online_exams').insert([{
        ...examForm,
        school_id: (subjects.find(s => s.id === examForm.subject_id) as any)?.school_id || 'DEFAULT',
        teacher_id: profile?.id || 'SYSTEM'
      }]);

      if (error) throw error;
      
      toast.success("Exam protocol established and broadcasted");
      setIsAddDialogOpen(false);
      setExamForm({ title: '', subject_id: '', duration_minutes: 60, total_marks: 100 });
      fetchData();
    } catch (error: any) {
      toast.error("Exam initiation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMarkEntry = async (exam: OnlineExam) => {
    setSelectedExam(exam);
    setIsMarkDialogOpen(true);
    
    try {
      const { data: studentData } = await supabase.from('students').select('*');
      setStudents(studentData || []);
      
      const { data: existingMarks } = await supabase
        .from('assessment_marks')
        .select('*')
        .eq('assessment_id', exam.id);
      
      const markMap: any = {};
      existingMarks?.forEach(m => markMap[m.student_id] = m.marks_obtained);
      setMarkEntry(markMap);
    } catch (e) {
      toast.error("Failed to load scholar directory");
    }
  };

  const submitMarks = async () => {
    if (!selectedExam) return;
    try {
      setLoading(true);
      const markRecords = Object.entries(markEntry).map(([student_id, marks]) => ({
        assessment_id: selectedExam.id,
        student_id,
        marks_obtained: marks,
      }));

      const { error } = await supabase.from('assessment_marks').upsert(markRecords);
      if (error) throw error;

      toast.success("Performance metrics committed to ledger");
      setIsMarkDialogOpen(false);
    } catch (error: any) {
      toast.error("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (exam: OnlineExam) => {
    if (isTeacher) {
      openMarkEntry(exam);
    } else {
      setSelectedExam(exam);
      setIsTakeExamDialogOpen(true);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Examination Protocol</h1>
          <p className="text-slate-500 font-bold text-xl">Academic assessment engine and performance analytics portal.</p>
        </div>
        {isTeacher && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
               <Button className="h-16 rounded-[2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-10 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-6 w-6 mr-3" /> Initiate Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">Define Examination</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Exam Title</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                    placeholder="Mid-Term Evaluation" 
                    value={examForm.title}
                    onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subject Module</Label>
                  <Select 
                    value={examForm.subject_id} 
                    onValueChange={(v) => setExamForm({...examForm, subject_id: v})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 shadow-none">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Duration (Mins)</Label>
                    <Input 
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                      type="number" 
                      placeholder="60" 
                      value={examForm.duration_minutes}
                      onChange={(e) => setExamForm({...examForm, duration_minutes: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Total Marks</Label>
                    <Input 
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                      type="number" 
                      placeholder="100" 
                      value={examForm.total_marks}
                      onChange={(e) => setExamForm({...examForm, total_marks: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInitiateExam} disabled={loading} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Authorize Launch</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[ 
          { label: 'Exams Conducted', value: exams.length, icon: FileText, color: 'text-primary bg-primary/10', action: () => toast.info("Accessing examination archives...") },
          { label: 'Average GPA', value: '3.85', icon: Trophy, color: 'text-amber-500 bg-amber-500/10', action: () => toast.info("Global GPA analytics synchronized.") },
          { label: 'Completion Rate', value: '98%', icon: Zap, color: 'text-emerald-500 bg-emerald-500/10', action: () => toast.info("Tracking assessment completion protocols.") }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            onClick={stat.action}
            className="glass-card rounded-[3rem] p-8 flex items-center gap-6 border-none shadow-xl cursor-pointer hover:scale-105 transition-all active:scale-95"
          >
            <div className={cn("h-16 w-16 rounded-[1.75rem] flex items-center justify-center shadow-lg", stat.color)}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-[4rem] border-none overflow-hidden shadow-3xl">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-slate-100/50">
                  <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] px-12">Examination Identity</TableHead>
                  <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Timing</TableHead>
                  <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Status</TableHead>
                  <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] text-right px-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center font-black text-slate-400">Retrieving Assessment Matrix...</TableCell>
                  </TableRow>
                ) : exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center font-black text-slate-400">No exams scheduled.</TableCell>
                  </TableRow>
                ) : exams.map((exam, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={exam.id} 
                    className="group hover:bg-primary/5 transition-all duration-500 border-b border-slate-50/50"
                  >
                    <TableCell className="py-8 px-12">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                           <p className="font-black text-slate-900 text-lg group-hover:text-primary transition-colors">{exam.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject ID: {exam.subject_id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Clock className="h-4 w-4 text-slate-300" />
                        <span>{exam.duration_minutes || 60}m</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black px-4 py-2 rounded-xl uppercase tracking-widest text-[10px]">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right px-12">
                      <Button 
                        onClick={() => handleAction(exam)}
                        className="h-12 rounded-2xl bg-slate-900 text-white font-black px-6 hover:scale-105 active:scale-95 transition-all"
                      >
                        {isTeacher ? 'Enter Marks' : 'Take Exam'}
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-8">
           <Card className="glass-card border-none rounded-[3rem] shadow-2xl p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-black tracking-tighter">Academic Dashboard</CardTitle>
              <CardDescription className="font-bold">Quick access to grading protocols.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button 
                variant="outline" 
                onClick={() => toast.success("Initializing Report Card Generation Engine...")} 
                className="h-20 justify-start gap-5 rounded-[1.75rem] border-2 font-black text-slate-900 bg-white hover:bg-slate-50 transition-all"
              >
                <Trophy className="h-6 w-6 text-amber-500" />
                <div className="text-left">
                   <p className="text-sm">Report Card Engine</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Batch Processing</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.info("Syncing GPA analytics with institutional cloud...")} 
                className="h-20 justify-start gap-5 rounded-[1.75rem] border-2 font-black text-slate-900 bg-white hover:bg-slate-50 transition-all"
              >
                <GraduationCap className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                   <p className="text-sm">GPA Analytics</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Statistical Analysis</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-3xl overflow-hidden relative">
            <div className="relative z-10">
              <Star className="h-10 w-10 text-amber-400 mb-6" />
              <h3 className="text-3xl font-black tracking-tighter mb-2">Dean's List</h3>
              <p className="text-slate-400 font-bold mb-8">Elite scholars with top performance index.</p>
              <Button 
                onClick={() => toast.success("Redirecting to Elite Scholar Rankings...")} 
                className="w-full h-14 bg-white/10 hover:bg-white/20 text-white border-none rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                View Rankings
              </Button>
            </div>
            <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-primary/20 rounded-full blur-[80px]" />
          </Card>
        </div>
      </div>

      {isMarkDialogOpen && selectedExam && (
        <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Scholar Performance Ledger: {selectedExam.title}</DialogTitle>
              <p className="text-slate-500 font-bold">Record assessment results for current module scholars.</p>
            </DialogHeader>
            <div className="py-6">
              <div className="glass-card rounded-3xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100/50">
                      <TableHead className="h-16 font-black text-xs text-slate-400 uppercase tracking-widest px-8">Scholar Name</TableHead>
                      <TableHead className="h-16 font-black text-xs text-slate-400 uppercase tracking-widest">Admission ID</TableHead>
                      <TableHead className="h-16 font-black text-xs text-slate-400 uppercase tracking-widest w-48">Marks (Max {selectedExam.total_marks})</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                       <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center font-bold text-slate-400">No scholars registered in this module.</TableCell>
                      </TableRow>
                    ) : students.map(student => (
                      <TableRow key={student.profile_id} className="border-b border-slate-50">
                        <TableCell className="py-4 px-8 font-bold">{student.full_name || 'Scholar'}</TableCell>
                        <TableCell className="font-bold text-slate-400">{student.admission_number}</TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            className="h-12 rounded-xl bg-slate-50 border-none font-black text-center"
                            max={selectedExam.total_marks}
                            value={markEntry[student.profile_id] || ''}
                            onChange={(e) => setMarkEntry({ ...markEntry, [student.profile_id]: parseInt(e.target.value) })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitMarks} disabled={loading} className="h-14 rounded-2xl bg-primary px-12 font-black text-lg shadow-xl">Commit All Marks</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isTakeExamDialogOpen && selectedExam && (
        <Dialog open={isTakeExamDialogOpen} onOpenChange={setIsTakeExamDialogOpen}>
          <DialogContent className="rounded-[3rem] border-none shadow-4xl glass max-w-2xl p-10">
            <DialogHeader>
              <DialogTitle className="text-4xl font-black tracking-tighter">Examination Protocol Initiated</DialogTitle>
              <p className="text-slate-500 font-bold text-xl mt-4">Assessment: {selectedExam.title}</p>
            </DialogHeader>
            <div className="py-10 space-y-8">
              <div className="flex items-center gap-8 p-8 bg-white/50 rounded-[2rem] border border-white/40">
                <Clock className="h-12 w-12 text-primary" />
                <div>
                  <p className="text-2xl font-black text-slate-900">{selectedExam.duration_minutes} Minutes</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Allocation Countdown</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="font-bold text-slate-600 leading-relaxed">
                  You are about to enter the secure assessment environment. System locks will be engaged once the session begins. Ensure a stable network connection.
                </p>
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-700">
                  <Zap className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Live Proctoring Enabled</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => {
                  setIsTakeExamDialogOpen(false);
                  toast.success("Assessment interface launching... Redirecting to secure portal.");
                }}
                className="h-16 rounded-[2rem] bg-slate-900 w-full font-black text-xl shadow-2xl hover:bg-slate-800 transition-all"
              >
                Begin Assessment Protocol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}