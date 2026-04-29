import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Trash2, Edit, Filter, ShieldCheck, Mail, Phone, MoreHorizontal } from 'lucide-react';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'student' as UserRole,
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.full_name) {
      toast.error("Please fill in full name");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').insert([
        { 
          full_name: formData.full_name, 
          role: formData.role,
          phone: formData.phone
        }
      ]);

      if (error) throw error;
      
      toast.success("User record created successfully");
      setIsAddDialogOpen(false);
      fetchUsers();
      setFormData({ full_name: '', email: '', role: 'student', phone: '' });
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          phone: formData.phone
        })
        .eq('id', editingUser.id);

      if (error) throw error;
      
      toast.success("User clearance updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success("User profile deleted");
      fetchUsers();
    } catch (error: any) {
      toast.error("Error deleting: " + error.message);
    }
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      email: '',
      role: user.role,
      phone: user.phone || ''
    });
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'school_admin': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'teacher': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'student': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'accountant': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">User Protocol</h1>
          <p className="text-slate-500 font-bold text-xl">Administrative control for staff, scholars, and external stakeholders.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 rounded-[2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black px-10 transition-all hover:scale-105 active:scale-95">
              <UserPlus className="h-6 w-6 mr-3" /> Provision User
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">New User Provisioning</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Nomenclature</Label>
                <Input 
                  placeholder="e.g. Johnathan Doe" 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Digital Identity (Email)</Label>
                <Input 
                  type="email" 
                  placeholder="john@academy.gl" 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Access Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="school_admin">School Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Protocol</Label>
                  <Input 
                    placeholder="+1..." 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="h-14 rounded-2xl font-black">Cancel</Button>
              <Button onClick={handleAddUser} disabled={loading} className="h-14 rounded-2xl bg-primary px-8 font-black">{loading ? 'Processing...' : 'Execute Provisioning'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
        {[ 
          { label: 'System Admins', value: users.filter(u => u.role.includes('admin')).length, icon: ShieldCheck, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Faculty', value: users.filter(u => u.role === 'teacher').length, icon: UserPlus, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Student Body', value: users.filter(u => u.role === 'student').length, icon: Filter, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'External', value: users.filter(u => !['admin', 'teacher', 'student'].some(r => u.role.includes(r))).length, icon: Mail, color: 'text-amber-500 bg-amber-500/10' }
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

      <Card className="glass-card border-none rounded-[3rem] shadow-xl p-3">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search directory by name, role, or contact..." 
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
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] px-12">User Identity</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Access Clearance</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">Contact Protocol</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em]">System Status</TableHead>
              <TableHead className="h-24 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] text-right px-12">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-slate-400 font-bold">Querying Database...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-slate-400 font-bold">No records found.</TableCell>
              </TableRow>
            ) : filteredUsers.map((user, idx) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user.id} 
                className="group hover:bg-primary/5 transition-all duration-500 border-b border-slate-50/50"
              >
                <TableCell className="py-8 px-12">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-xl rounded-2xl">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black">{user.full_name?.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-lg group-hover:text-primary transition-colors">{user.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID: {user.id.substring(0, 8)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none", getRoleBadgeColor(user.role))}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-600">{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-12">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                        <MoreHorizontal className="h-6 w-6 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-none shadow-2xl glass">
                      <DropdownMenuItem onClick={() => openEditDialog(user)} className="rounded-xl cursor-pointer p-3 font-bold text-slate-900">
                        <Edit className="h-4 w-4 mr-3" /> Edit Clearance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="rounded-xl cursor-pointer p-3 font-bold text-rose-500 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4 mr-3" /> Revoke Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="rounded-[2.5rem] border-none shadow-4xl glass max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter">Modify Clearance: {editingUser.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Nomenclature</Label>
                <Input 
                  className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Access Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="school_admin">School Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Protocol</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={() => setEditingUser(null)} className="h-14 rounded-2xl font-black">Cancel</Button>
              <Button onClick={handleUpdateUser} disabled={loading} className="h-14 rounded-2xl bg-primary px-8 font-black">{loading ? 'Processing...' : 'Commit Changes'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}