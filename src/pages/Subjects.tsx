import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, MoreHorizontal, BookOpen, Layers, Target, ShieldCheck } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!formData.name) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('subjects').insert([formData]);
      if (error) throw error;
      toast.success("Curriculum module defined");
      setIsAddDialogOpen(false);
      setFormData({ name: '', code: '' });
      fetchSubjects();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !formData.name) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('subjects')
        .update(formData)
        .eq('id', editingSubject.id);
      
      if (error) throw error;
      toast.success("Module configuration updated");
      setEditingSubject(null);
      fetchSubjects();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to retire this curriculum module?")) return;
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      toast.success("Module retired successfully");
      fetchSubjects();
    } catch (error: any) {
      toast.error("Deletion failed: " + error.message);
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, code: subject.code || '' });
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Curriculum Modules</h1>
          <p className="text-slate-500 font-bold text-xl">Defining the academic subjects and learning protocols.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 rounded-[2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-10 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-6 w-6 mr-3" /> Define Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">New Module Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Module Name</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  placeholder="e.g. Theoretical Physics" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">System Code</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  placeholder="e.g. PHYS-401"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSubject} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Establish Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[ 
          { label: 'Active Modules', value: subjects.length, icon: BookOpen, color: 'text-primary bg-primary/10' },
          { label: 'Dept Coverage', value: '100%', icon: Target, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Verified Status', value: 'Alpha', icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-500/10' }
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
                placeholder="Search curriculum by nomenclature or code..." 
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
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] px-12">Curriculum Module</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">System Code</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Assigned Faculty</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] text-right px-12">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center font-black text-slate-400">Retrieving Curriculum...</TableCell>
              </TableRow>
            ) : filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center font-black text-slate-400">No curriculum identified.</TableCell>
              </TableRow>
            ) : filteredSubjects.map((subject, idx) => (
              <motion.tr 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={subject.id} 
                className="group hover:bg-primary/5 transition-all duration-500 border-b border-slate-50/50"
              >
                <TableCell className="py-8 px-12">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all">
                      <BookOpen className="h-6 w-6 text-indigo-500" />
                    </div>
                    <p className="font-black text-slate-900 text-xl tracking-tight">{subject.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200">{subject.code || 'GEN-001'}</Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-500">Faculty Not Assigned</TableCell>
                <TableCell className="text-right px-12">
                   <div className="flex justify-end gap-3">
                    <Button onClick={() => openEditDialog(subject)} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-lg">
                      <Edit className="h-5 w-5 text-slate-400" />
                    </Button>
                    <Button onClick={() => handleDeleteSubject(subject.id)} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-rose-50 text-rose-400">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingSubject && (
        <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Modify Module Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Module Name</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">System Code</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateSubject} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Update Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}