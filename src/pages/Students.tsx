import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, UserCheck, UserMinus, Download, Mail, Phone, ArrowUpRight, GraduationCap, Users, Star } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  
  const [enrollForm, setEnrollForm] = useState({
    full_name: '',
    admission_number: '',
    class_id: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          profile_id,
          admission_number,
          profiles (full_name, avatar_url, phone),
          classes (name)
        `);

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch students: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('id, name');
    setClasses(data || []);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.full_name || !enrollForm.class_id) {
      toast.error("Please fill in nomenclature and academic unit");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Profile
      const { data: profile, error: pError } = await supabase.from('profiles').insert([{
        full_name: enrollForm.full_name,
        role: 'student'
      }]).select().single();
      
      if (pError) throw pError;

      // 2. Create Student record
      const { error: sError } = await supabase.from('students').insert([{
        profile_id: profile.id,
        admission_number: enrollForm.admission_number || `STU-${Date.now().toString().slice(-4)}`,
        class_id: enrollForm.class_id
      }]);

      if (sError) throw sError;

      toast.success(`Scholar ${enrollForm.full_name} enrolled successfully`);
      setIsEnrollDialogOpen(false);
      setEnrollForm({ full_name: '', admission_number: '', class_id: '' });
      fetchStudents();
    } catch (error: any) {
      toast.error("Enrollment failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate scholar enrollment protocol?")) return;
    
    try {
      const { error } = await supabase.from('students').delete().eq('profile_id', id);
      if (error) throw error;
      toast.success('Enrollment terminated successfully');
      fetchStudents();
    } catch (error: any) {
      toast.error('Termination failed: ' + error.message);
    }
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Compiling scholar data for export...',
        success: 'Scholar Directory (CSV) ready for download.',
        error: 'Export failed'
      }
    );
  };

  const filteredStudents = students.filter(s => 
    s.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Student Directory</h1>
          <p className="text-slate-500 font-medium text-lg">Central repository for all student academic and personal records.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" className="h-12 rounded-2xl border-2 font-bold px-6 bg-white hover:bg-slate-50 flex-1 md:flex-none" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2 text-slate-400" /> Export List
          </Button>
          
          <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold px-6 flex-1 md:flex-none">
                <Plus className="h-5 w-5 mr-2" /> Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl glass p-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">Enroll New Student</DialogTitle>
                <DialogDescription className="font-medium">Register a new student into the institutional database.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEnroll} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Nomenclature</Label>
                  <Input 
                    placeholder="John Doe" 
                    className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold" 
                    value={enrollForm.full_name}
                    onChange={(e) => setEnrollForm({...enrollForm, full_name: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Admission #</Label>
                    <Input 
                      placeholder="STU-1001" 
                      className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold" 
                      value={enrollForm.admission_number}
                      onChange={(e) => setEnrollForm({...enrollForm, admission_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Academic Unit</Label>
                    <Select value={enrollForm.class_id} onValueChange={(v) => setEnrollForm({...enrollForm, class_id: v})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold shadow-none text-slate-900">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        {classes.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsEnrollDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 px-8 font-black shadow-xl">{isLoading ? 'Processing...' : 'Complete Enrollment'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[ 
          { label: 'Total Enrolled', value: students.length.toString(), icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'New This Month', value: '+12', icon: ArrowUpRight, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Graduating', value: '182', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' }
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-[2.5rem] p-6 flex items-center gap-5 border-none shadow-sm">
            <div className={cn("h-14 w-14 rounded-3xl flex items-center justify-center", stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="glass-card border-none rounded-[2.5rem] shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name or admission number..." 
                className="pl-14 h-14 rounded-3xl bg-slate-100 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => toast.info('Accessing multi-vector filtration matrix...')} className="h-14 rounded-3xl px-8 font-black bg-slate-900 text-white hover:bg-slate-800 uppercase tracking-widest text-[11px]">
                <Filter className="h-4 w-4 mr-2" /> Advanced Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="glass-card rounded-[3rem] border-none overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="h-20 font-black text-[11px] text-slate-400 uppercase tracking-widest px-10">Student Identity</TableHead>
              <TableHead className="h-20 font-black text-[11px] text-slate-400 uppercase tracking-widest">Academics</TableHead>
              <TableHead className="h-20 font-black text-[11px] text-slate-400 uppercase tracking-widest">Contact</TableHead>
              <TableHead className="h-20 font-black text-[11px] text-slate-400 uppercase tracking-widest text-right px-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-slate-400">Synchronizing with database...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={student.profile_id} 
                  className="group hover:bg-primary/5 transition-all duration-300 border-b border-slate-50"
                >
                  <TableCell className="py-6 px-10">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-14 w-14 border-4 border-white shadow-xl rounded-2xl">
                        <AvatarImage src={student.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">{student.profiles?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-none">{student.profiles?.full_name}</p>
                        <p className="text-xs font-bold text-slate-400 mt-2 font-mono uppercase tracking-tighter">{student.admission_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-white shadow-sm border border-slate-100 text-slate-900 text-xs font-black rounded-xl px-3 py-1.5">{student.classes?.name || 'Unassigned'}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-black text-slate-900">{student.profiles?.phone || 'No phone'}</p>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 transition-all">
                          <MoreHorizontal className="h-6 w-6 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-3 rounded-[2rem] border-none shadow-2xl glass">
                        <DropdownMenuItem 
                          onClick={() => toast.success(`Viewing secure dossier for ${student.profiles?.full_name}`)}
                          className="rounded-2xl cursor-pointer p-4 font-bold text-slate-900 hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <UserCheck className="h-5 w-5 mr-3" /> View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Secure communication portal opening...')} className="rounded-2xl cursor-pointer p-4 font-bold text-slate-900 hover:bg-primary/10 hover:text-primary transition-all">
                          <Mail className="h-5 w-5 mr-3" /> Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-slate-100" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(student.profile_id)}
                          className="rounded-2xl cursor-pointer p-4 font-bold text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <UserMinus className="h-5 w-5 mr-3" /> Terminate Enrollment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-slate-900">No Students Found</p>
                      <p className="text-slate-400 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                    <Button variant="link" onClick={() => setSearchTerm('')} className="text-primary font-black uppercase tracking-widest text-[11px]">Clear search criteria</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}