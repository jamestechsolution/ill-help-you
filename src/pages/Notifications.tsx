import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle,
  Info,
  User,
  CalendarCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<{id: string, full_name: string}[]>([]);

  useEffect(() => {
    fetchNotifications();
    if (profile?.role === 'teacher') fetchAdmins();
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*, sender:profiles!sender_id(full_name)')
        .eq('recipient_id', profile?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast.error("Error fetching notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['super_admin', 'school_admin']);
    setAdmins(data || []);
  };

  const handleSendNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const recipientId = formData.get('recipient_id') as string;
    if (!recipientId) {
      toast.error("Please select a recipient");
      return;
    }

    const newNotification = {
      sender_id: profile?.id,
      recipient_id: recipientId,
      type: formData.get('type') as string,
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      is_read: false
    };

    try {
      const { error } = await supabase.from('notifications').insert([newNotification]);
      if (error) throw error;
      toast.success("Message sent to School Director");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Failed to send: " + error.message);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance': return <CalendarCheck className="h-4 w-4 text-rose-500" />;
      case 'grade': return <Info className="h-4 w-4 text-blue-500" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Communication Hub</h1>
          <p className="text-muted-foreground">Direct messaging and system alerts.</p>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          {profile?.role === 'teacher' && <TabsTrigger value="compose">Compose to Director</TabsTrigger>}
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Received Notifications</CardTitle>
              <CardDescription>Messages from school administration and system alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-10">Loading messages...</p>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>Your inbox is empty.</p>
                  </div>
                ) : notifications.map((notif) => (
                  <div key={notif.id} className={`flex gap-4 p-4 rounded-lg border transition-colors ${notif.is_read ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}>
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-bold">{notif.title}</p>
                        <span className="text-xs text-muted-foreground">{format(new Date(notif.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-[10px] text-primary/60 mt-2">From: {(notif as any).sender?.full_name || 'System'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Send Message to Director</CardTitle>
              <CardDescription>Alert the administration about attendance, grades, or other issues.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient (Director)</Label>
                    <Select name="recipient_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Director" />
                      </SelectTrigger>
                      <SelectContent>
                        {admins.map(admin => (
                          <SelectItem key={admin.id} value={admin.id}>{admin.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="type" defaultValue="alert">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendance">Attendance Alert</SelectItem>
                        <SelectItem value="grade">Grade Performance</SelectItem>
                        <SelectItem value="alert">General Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input name="title" required placeholder="Brief subject line..." />
                </div>
                <div className="space-y-2">
                  <Label>Message Details</Label>
                  <Textarea name="message" required placeholder="Provide full context for the director..." className="min-h-[150px]" />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" /> Send Notification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}