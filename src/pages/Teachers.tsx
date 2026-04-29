import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Trash2, Edit, MoreHorizontal, GraduationCap, Briefcase, Mail, Phone, BookOpen, Award, UserCheck } from 'lucide-react';
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Teacher, Profile } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialization: '',
    employee_id: '',
    department: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles:profile_id (
            full_name,
            avatar_url,
            phone
          )
        `);
      
      if (error) throw error;
      
      const formattedData = data.map((t: any) => ({
        ...t,
        full_name: t.profiles?.full_name || 'Unknown',
        avatar_url: t.profiles?.avatar_url,
        phone: t.profiles?.phone
      }));
      
      setTeachers(formattedData || []);
    } catch (error: any) {
      toast.error("Error fetching teachers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!formData.full_name || !formData.employee_id) {
      toast.error("Please provide full name and employee ID");
      return;
    }

    try {
      setLoading(true);
      // In a real app, we'd use a Supabase Edge Function to create Auth user + Profile + Teacher
      // Here we simulate by creating a profile first (if allowed) and then a teacher
      
      // 1. Check if profile exists or create dummy
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          full_name: formData.full_name, 
          role: 'teacher' 
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Create teacher record
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert([{
          profile_id: profileData.id,
          employee_id: formData.employee_id,
          specialization: formData.specialization
        }]);

      if (teacherError) throw teacherError;

      toast.success("Faculty member inducted successfully");
      setIsAddDialogOpen(false);
      fetchTeachers();
      setFormData({ full_name: '', email: '', specialization: '', employee_id: '', department: '' });
    } catch (error: any) {
      toast.error("Induction failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;
    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          specialization: formData.specialization,
          employee_id: formData.employee_id
        })
        .eq('profile_id', editingTeacher.profile_id);

      if (error) throw error;

      toast.success("Faculty profile updated");
      setEditingTeacher(null);
      fetchTeachers();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    }
  };

  const handleDeleteTeacher = async (profileId: string) => {
    if (!confirm("Are you sure you want to terminate this faculty contract?")) return;
    
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('profile_id', profileId);

      if (error) throw error;
      
      toast.success("Faculty record removed");
      fetchTeachers();
    } catch (error: any) {
      toast.error("Termination failed: " + error.message);
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      full_name: teacher.full_name || '',
      email: '',
      specialization: teacher.specialization || '',
      employee_id: teacher.employee_id || '',
      department: ''
    });
  };

  const filteredTeachers = teachers.filter(t => 
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Faculty Registry</h1>
          <p className="text-slate-500 font-bold text-xl">Manage educator profiles, specializations, and departmental assignments.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 rounded-[2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-10 transition-all hover:scale-105 active:scale-95">
              <UserPlus className="h-6 w-6 mr-3" /> Induct Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Faculty Induction</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  placeholder="Dr. Sarah Smith" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Specialization</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  placeholder="Quantum Physics" 
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Employee ID</Label>
                   <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                    placeholder="EMP-2024-001" 
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Department</Label>
                   <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                    placeholder="Science" 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                   />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTeacher} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Authorize Induction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[ 
          { label: 'Total Faculty', value: teachers.length, icon: GraduationCap, color: 'text-primary bg-primary/10' },
          { label: 'Academic Depts', value: '8', icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Awarded Research', value: '12', icon: Award, color: 'text-emerald-500 bg-emerald-500/10' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card rounded-[3rem] p-8 flex items-center gap-6 border-none shadow-xl"
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

      <Card className="glass-card border-none rounded-[3rem] shadow-xl p-3">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by faculty name, ID, or domain expertise..." 
                className="pl-16 h-16 rounded-[2rem] bg-slate-50 border-none focus-visible:ring-8 focus-visible:ring-primary/5 transition-all font-black text-slate-900 text-lg shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="glass-card rounded-[4rem] border-none overflow-hidden shadow-3xl">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100/50">
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] px-12">Faculty Identity</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Employee ID</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Specialization</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Status</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] text-right px-12">Protocol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center font-black text-slate-400">Synchronizing Faculty Data...</TableCell>
              </TableRow>
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center font-black text-slate-400">No faculty records identified.</TableCell>
              </TableRow>
            ) : filteredTeachers.map((teacher, idx) => (
              <motion.tr 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                key={teacher.profile_id} 
                className="group hover:bg-primary/5 transition-all duration-500 border-b border-slate-50/50"
              >
                <TableCell className="py-8 px-12">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-16 w-16 border-4 border-white shadow-xl rounded-[1.75rem]">
                      <AvatarFallback className="bg-primary/10 text-primary font-black">{teacher.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-xl group-hover:text-primary transition-colors">{teacher.full_name}</p>
                      <div className="flex items-center gap-3">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Correspondence</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-slate-100 text-slate-600 border-none font-black px-4 py-2 rounded-xl">{teacher.employee_id}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span className="font-bold text-slate-700">{teacher.specialization || 'General Faculty'}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">On Duty</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-white hover:shadow-xl transition-all">
                        <MoreHorizontal className="h-7 w-7 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-3 rounded-[2rem] border-none shadow-4xl glass">
                      <DropdownMenuItem onClick={() => openEditDialog(teacher)} className="rounded-xl cursor-pointer p-4 font-bold text-slate-900 hover:bg-primary/10">
                         <Edit className="h-4 w-4 mr-4" /> Modify Credentials
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteTeacher(teacher.profile_id)} className="rounded-xl cursor-pointer p-4 font-bold text-rose-500 hover:bg-rose-50">
                         <Trash2 className="h-4 w-4 mr-4" /> Terminate Contract
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingTeacher && (
        <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Modify Faculty Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Specialization</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Employee ID</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateTeacher} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Update Credentials</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}