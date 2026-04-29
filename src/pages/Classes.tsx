import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, MoreHorizontal, GraduationCap, Users, Layout, MapPin, Layers } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Class } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: '', section: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('classes').select('*').order('name');
      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!formData.name) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('classes').insert([formData]);
      if (error) throw error;
      toast.success("Class architectural unit created");
      setIsAddDialogOpen(false);
      setFormData({ name: '', section: '' });
      fetchClasses();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClass || !formData.name) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('classes')
        .update(formData)
        .eq('id', editingClass.id);
      
      if (error) throw error;
      toast.success("Unit configuration updated");
      setEditingClass(null);
      fetchClasses();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to dismantle this unit?")) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      toast.success("Unit dismantled successfully");
      fetchClasses();
    } catch (error: any) {
      toast.error("Deletion failed: " + error.message);
    }
  };

  const openEditDialog = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, section: cls.section || '' });
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">Academic Units</h1>
          <p className="text-slate-500 font-bold text-xl">Architectural definition of classrooms and organizational sections.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 rounded-[2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-10 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-6 w-6 mr-3" /> Define New Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Define Class Unit</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nomenclature (Name)</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  placeholder="e.g. Grade 10" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sector (Section)</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  placeholder="e.g. Alpha"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddClass} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Construct Unit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
        {[ 
          { label: 'Total Units', value: classes.length, icon: Layout, color: 'text-primary bg-primary/10' },
          { label: 'Active Sectors', value: '12', icon: Layers, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Campus Slots', value: '24', icon: MapPin, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Avg Density', value: '32', icon: Users, color: 'text-amber-500 bg-amber-500/10' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card rounded-[2.5rem] p-8 flex items-center gap-6 border-none shadow-xl"
          >
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-[4rem] border-none overflow-hidden shadow-3xl">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100/50">
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] px-12">Architectural Unit</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Sector Identifier</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Assigned Faculty</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Scholar Density</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] text-right px-12">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center font-black text-slate-400">Retrieving Architecture...</TableCell>
              </TableRow>
            ) : filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center font-black text-slate-400">No units defined.</TableCell>
              </TableRow>
            ) : filteredClasses.map((cls, idx) => (
              <motion.tr 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={cls.id} 
                className="group hover:bg-primary/5 transition-all duration-500 border-b border-slate-50/50"
              >
                <TableCell className="py-8 px-12">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-primary font-black text-xl border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                      {cls.name.charAt(0)}
                    </div>
                    <p className="font-black text-slate-900 text-xl">{cls.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-2 rounded-xl">{cls.section || 'General'}</Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-600">Lead Architect Assigned</TableCell>
                <TableCell className="font-bold text-slate-400">32 Scholars</TableCell>
                <TableCell className="text-right px-12">
                   <div className="flex justify-end gap-3">
                    <Button onClick={() => openEditDialog(cls)} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-lg">
                      <Edit className="h-5 w-5 text-slate-400" />
                    </Button>
                    <Button onClick={() => handleDeleteClass(cls.id)} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-rose-50 text-rose-400">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingClass && (
        <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Modify Unit Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nomenclature (Name)</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sector (Section)</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateClass} className="h-14 rounded-2xl bg-primary w-full font-black text-lg">Update Unit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}