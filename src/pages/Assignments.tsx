import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Upload,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Assignment, Submission } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AssignmentsPage() {
  const { profile } = useAuth();
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'school_admin';
  const isStudent = profile?.role === 'student';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [profile]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      let query = supabase.from('assignments').select('*');
      
      if (isStudent) {
        // In a real app, filter by student's class_id
        // query = query.eq('class_id', profile.class_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast.error("Error fetching assignments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAssignment = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      due_date: formData.get('due_date') as string,
      max_points: parseInt(formData.get('max_points') as string) || 100,
      teacher_id: profile?.id,
      school_id: '00000000-0000-0000-0000-000000000001', // Albrighty Academy ID from migration
    };

    try {
      const { error } = await supabase.from('assignments').insert([newAssignment]);
      if (error) throw error;
      toast.success("Assignment created successfully");
      setIsCreateModalOpen(false);
      fetchAssignments();
    } catch (error: any) {
      toast.error("Failed to create assignment: " + error.message);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    try {
      const submission = {
        assignment_id: assignmentId,
        student_id: profile?.id,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('submissions').insert([submission]);
      if (error) throw error;
      toast.success("Assignment submitted successfully!");
    } catch (error: any) {
      toast.error("Failed to submit: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Manage coursework and student submissions.</p>
        </div>
        {isTeacher && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateAssignment}>
                <DialogHeader>
                  <DialogTitle>New Assignment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required placeholder="e.g., Math Homework #5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Detail the task for students..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input id="due_date" name="due_date" type="datetime-local" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_points">Max Points</Label>
                      <Input id="max_points" name="max_points" type="number" defaultValue="100" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted mb-2" />
              <CardContent className="h-32 bg-muted/50" />
            </Card>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No assignments found</h3>
          <p className="text-muted-foreground">Start by creating your first classroom task.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="mb-2">Assignment</Badge>
                  <Button variant="ghost" size="icon" className="-mt-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Due: {format(new Date(assignment.due_date), 'PPP')}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Points: {assignment.max_points}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-muted/20">
                {isStudent ? (
                  <Button className="w-full gap-2" onClick={() => handleSubmitAssignment(assignment.id)}>
                    <Upload className="h-4 w-4" /> Submit Assignment
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Submissions view coming soon")}>
                    View Submissions
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}