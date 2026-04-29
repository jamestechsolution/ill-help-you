import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  FileText, 
  Download, 
  Search,
  MoreVertical,
  Trash2,
  FileBox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types';
import { toast } from 'sonner';

export function DocumentsPage() {
  const { profile } = useAuth();
  const isStaff = ['super_admin', 'school_admin', 'teacher'].includes(profile?.role || '');
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [profile]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast.error("Error fetching documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resource Center</h1>
          <p className="text-muted-foreground">Study materials, syllabi, and administrative documents.</p>
        </div>
        {isStaff && (
          <Button className="gap-2" onClick={() => toast.info("Upload coming soon")}>
            <Plus className="h-4 w-4" /> Upload Document
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed text-center">
          <FileBox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-muted-foreground">No resources have been shared with you yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="hover:border-primary transition-colors cursor-pointer group flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="p-2 rounded bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-base mt-2 line-clamp-1">{doc.title}</CardTitle>
                <CardDescription className="text-xs">{doc.category || 'General'}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-[10px] text-muted-foreground">Added {new Date(doc.created_at).toLocaleDateString()}</p>
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs" asChild>
                  <a href={doc.file_url} target="_blank" rel="noreferrer">
                    <Download className="h-3 w-3" /> Download
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}