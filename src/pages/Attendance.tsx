import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save,
  ClipboardCheck,
  Filter,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function Attendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('classes').select('id, name');
      if (error) throw error;
      setClasses(data || []);
      if (data && data.length > 0) setSelectedClass(data[0].id);
    } catch (error: any) {
      toast.error('Failed to load classes: ' + error.message);
    }
  };

  const fetchStudents = async (classId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          profile_id,
          admission_number,
          profiles (full_name)
        `)
        .eq('class_id', classId);

      if (error) throw error;
      setStudents(data || []);
      
      const initialAttendance: Record<string, string> = {};
      data?.forEach(s => initialAttendance[s.profile_id] = 'present');
      setAttendance(initialAttendance);
    } catch (error: any) {
      toast.error('Failed to load students: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = (id: string, status: string) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: selectedClass,
      status: status,
      date: new Date().toISOString().split('T')[0]
    }));

    toast.promise(
      (async () => {
        const { error } = await supabase.from('attendance').upsert(records);
        if (error) throw error;
      })(),
      {
        loading: 'Synchronizing attendance data...',
        success: 'Attendance records archived successfully!',
        error: (err) => 'Failed to save attendance: ' + (err.message || 'Unknown error')
      }
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Attendance Records</h1>
          <p className="text-slate-500 font-medium text-lg">Efficiently log and track daily student presence.</p>
        </div>
        <Button 
          className="h-14 rounded-3xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-10"
          onClick={handleSave}
          disabled={students.length === 0 || isLoading}
        >
          <Save className="h-5 w-5 mr-3" /> Save Attendance
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-4 glass-card border-none rounded-[3rem] p-4 h-fit">
          <CardHeader className="pb-10">
            <div className="h-16 w-16 rounded-[2rem] bg-slate-900 flex items-center justify-center mb-6 shadow-2xl">
               <Filter className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Module Config</CardTitle>
            <CardDescription className="font-medium">Set filters to populate student list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-14 rounded-[1.5rem] bg-slate-50 border-none font-bold text-slate-900">
                  <SelectValue placeholder="Choose Class" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date Selected</label>
              <div className="h-14 flex items-center gap-4 px-5 bg-slate-50 rounded-[1.5rem] border-none">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="pt-6">
              <Card className="bg-slate-900 text-white rounded-[2rem] border-none p-6 relative overflow-hidden">
                <ClipboardCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Configuration Status</p>
                <div className="flex justify-between items-end">
                  <h4 className="text-3xl font-black tracking-tight">{students.length > 0 ? 'Ready' : 'Pending'}</h4>
                  <p className="text-[10px] font-bold text-white/70">{students.length} Students</p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 glass-card border-none rounded-[3.5rem] p-4">
          <CardHeader className="flex flex-row items-center justify-between pb-10">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900">Log Interface</CardTitle>
              <CardDescription className="font-medium">Click icons to mark student presence</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-slate-400">Retrieving student records...</p>
              </div>
            ) : students.length > 0 ? (
              students.map((student, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={student.profile_id} 
                  className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-slate-50 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-900 text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {student.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{student.profiles?.full_name}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {student.admission_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      size="icon" 
                      variant={attendance[student.profile_id] === 'present' ? 'default' : 'ghost'}
                      className={cn(
                        "h-14 w-14 rounded-2xl transition-all duration-300",
                        attendance[student.profile_id] === 'present' 
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" 
                          : "bg-slate-50 text-slate-400 hover:text-emerald-500"
                      )}
                      onClick={() => toggleStatus(student.profile_id, 'present')}
                    >
                      <CheckCircle2 className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant={attendance[student.profile_id] === 'absent' ? 'destructive' : 'ghost'}
                      className={cn(
                        "h-14 w-14 rounded-2xl transition-all duration-300",
                        attendance[student.profile_id] === 'absent' 
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600" 
                          : "bg-slate-50 text-slate-400 hover:text-rose-500"
                      )}
                      onClick={() => toggleStatus(student.profile_id, 'absent')}
                    >
                      <XCircle className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant={attendance[student.profile_id] === 'late' ? 'secondary' : 'ghost'}
                      className={cn(
                        "h-14 w-14 rounded-2xl transition-all duration-300",
                        attendance[student.profile_id] === 'late' 
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600" 
                          : "bg-slate-50 text-slate-400 hover:text-amber-500"
                      )}
                      onClick={() => toggleStatus(student.profile_id, 'late')}
                    >
                      <Clock className="h-6 w-6" />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Users className="h-16 w-16 text-slate-200" />
                <p className="font-bold text-slate-400">No students found for this class.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}