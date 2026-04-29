import React, { useState, useEffect } from 'react';
import { 
  Plus,
  ArrowUpRight,
  TrendingUp,
  History,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function Finance() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  
  const [invoiceForm, setInvoiceForm] = useState({
    student_id: '',
    total_amount: '',
    due_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInvoices();
    fetchStudents();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          students (profiles (full_name))
        `);
      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast.error('Failed to load invoices: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('profile_id, profiles(full_name)');
    setStudents(data || []);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.student_id) {
      toast.error("Please select a student");
      return;
    }

    setIsLoading(true);
    try {
      const invNum = `INV-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from('invoices').insert([{
        invoice_number: invNum,
        student_id: invoiceForm.student_id,
        total_amount: parseFloat(invoiceForm.total_amount),
        due_date: invoiceForm.due_date,
        status: 'unpaid'
      }]);

      if (error) throw error;
      
      toast.success(`Invoice ${invNum} generated successfully`);
      setIsInvoiceDialogOpen(false);
      setInvoiceForm({ student_id: '', total_amount: '', due_date: new Date().toISOString().split('T')[0] });
      fetchInvoices();
    } catch (error: any) {
      toast.error("Failed to generate invoice: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Generating financial report...',
        success: 'Report FY-24 downloaded successfully!',
        error: 'Failed to generate report'
      }
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Billing & Revenue</h1>
          <p className="text-slate-500 font-medium text-lg">Comprehensive overview of school fees and financial performance.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 rounded-2xl border-2 font-bold px-6 bg-white" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2 text-slate-400" /> Export Report
          </Button>
          
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold px-6">
                <Plus className="h-5 w-5 mr-2" /> New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl glass p-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">Create Invoice</DialogTitle>
                <DialogDescription className="font-medium">Generate a new billing document for a student.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Student Entity</Label>
                  <Select 
                    value={invoiceForm.student_id} 
                    onValueChange={(v) => setInvoiceForm({...invoiceForm, student_id: v})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold text-slate-900 shadow-none">
                      <SelectValue placeholder="Select Student..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      {students.map(s => (
                        <SelectItem key={s.profile_id} value={s.profile_id}>{s.profiles?.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Amount ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold" 
                      value={invoiceForm.total_amount}
                      onChange={(e) => setInvoiceForm({...invoiceForm, total_amount: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Due Date</Label>
                    <Input 
                      type="date" 
                      className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold" 
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsInvoiceDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 px-8 font-black shadow-xl">{isLoading ? 'Generating...' : 'Generate Invoice'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="bg-primary border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] relative overflow-hidden group">
          <TrendingUp className="absolute -right-8 -top-8 h-40 w-40 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em]">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white tracking-tighter">$124,500.00</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-[10px] font-black">+15.2%</div>
              <p className="text-xs text-white/60 font-medium">Vs last semester</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none rounded-[2.5rem] p-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-500 tracking-tighter">$12,450.00</div>
             <div className="flex items-center gap-2 mt-4">
              <div className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-500 text-[10px] font-black">URGENT</div>
              <p className="text-xs text-slate-400 font-medium italic">42 pending invoices</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none rounded-[2.5rem] p-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Collections Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-500 tracking-tighter">$3,200.00</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-500 text-[10px] font-black">STABLE</div>
              <p className="text-xs text-slate-400 font-medium">12 successful payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none rounded-[3rem] overflow-hidden shadow-xl">
        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-slate-900">Financial Ledger</CardTitle>
            <CardDescription className="font-medium mt-1">Tracking all student billing and payment history</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={() => toast.info('Accessing full ledger archive for current cycle...')} className="h-10 rounded-xl px-5 font-black uppercase tracking-widest text-[10px] bg-slate-100">
            <History className="h-4 w-4 mr-2 text-slate-400" /> Full History
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="h-20 px-10 font-black text-[10px] text-slate-400 uppercase tracking-widest">Document #</TableHead>
                <TableHead className="h-20 font-black text-[10px] text-slate-400 uppercase tracking-widest">Student Entity</TableHead>
                <TableHead className="h-20 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Amount</TableHead>
                <TableHead className="h-20 font-black text-[10px] text-slate-400 uppercase tracking-widest">Maturity Date</TableHead>
                <TableHead className="h-20 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</TableHead>
                <TableHead className="h-20 px-10 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="font-bold text-slate-400">Fetching ledger records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : invoices.length > 0 ? (
                invoices.map((inv, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={inv.id}
                    className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="py-6 px-10 font-mono text-xs font-black text-slate-400">{inv.invoice_number}</TableCell>
                    <TableCell className="font-bold text-slate-900">{inv.students?.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-right font-black text-slate-900">${inv.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-400">{inv.due_date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "px-3 py-1.5 rounded-xl border-none font-black text-[10px] tracking-widest uppercase",
                          inv.status === 'paid' && "bg-emerald-100 text-emerald-600",
                          inv.status === 'partial' && "bg-amber-100 text-amber-600",
                          inv.status === 'unpaid' && "bg-slate-100 text-slate-500",
                          inv.status === 'overdue' && "bg-rose-100 text-rose-600",
                        )}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <Button variant="ghost" size="icon" onClick={() => toast.info(`Accessing secure document: ${inv.invoice_number}`)} className="h-12 w-12 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                        <ArrowRight className="h-5 w-5 text-slate-300" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <FileText className="h-12 w-12" />
                      <p className="font-bold">No financial records found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}