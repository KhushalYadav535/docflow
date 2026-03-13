'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Download, Trash2, FileImage, FileBarChart, Clock, FolderTree } from 'lucide-react';
import { AdvancedSearch } from './AdvancedSearch';
import { apiRequest, apiClient, getApiConfig } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';
import { MoveDocumentDialog } from './MoveDocumentDialog';

interface Document {
  id: string;
  name: string;
  type?: string;
  size?: string;
  department?: string;
  uploaded_by?: string;
  uploadedBy?: string;
  uploaded_at?: string;
  uploadedAt?: string;
  snippet?: string;
  content?: string;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} className="bg-yellow-200 text-yellow-900 rounded px-1">{part}</span> : part
      )}
    </span>
  );
};

export function DocumentSearch() {
  const [filters, setFilters] = useState<any>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTime, setSearchTime] = useState(0);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string; folderId?: string } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      searchDocuments();
    } else {
      fetchDocuments();
    }
  }, [filters]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();
      const data = await apiRequest<Document[]>('/documents', { method: 'GET' });
      const endTime = Date.now();
      setSearchTime((endTime - startTime) / 1000);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch documents', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchDocuments = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();
      const params = new URLSearchParams();
      if (filters.keyword) params.append('q', filters.keyword);
      if (filters.documentType) params.append('type', filters.documentType);
      if (filters.department) params.append('department', filters.department);
      if (filters.uploadedBy) params.append('uploadedBy', filters.uploadedBy);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      // Enable natural language processing for queries longer than 10 characters
      if (filters.keyword && filters.keyword.length > 10) {
        params.append('naturalLanguage', 'true');
      }

      const data = await apiRequest<Document[]>(`/documents/search?${params.toString()}`, { method: 'GET' });
      const endTime = Date.now();
      setSearchTime((endTime - startTime) / 1000);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Search failed', error);
      toast.error('Search failed');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const config = getApiConfig();
      const blob = await apiClient.getDocumentFile(docId, undefined, config);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documents.find(d => d.id === docId)?.name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error: any) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiRequest(`/documents/${docId}`, { method: 'DELETE' });
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error: any) {
      toast.error('Delete failed');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Document Library</h2>

      {/* Advanced Search Component */}
      <div className="mb-6">
        <AdvancedSearch 
          onSearch={setFilters} 
          resultsCount={documents.length} 
          searchTime={searchTime} 
        />
      </div>

      {/* Result Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border bg-card rounded-lg overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg mt-6">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-foreground font-medium mb-1">No documents found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your advanced search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {documents.map((doc) => {
            const docType = doc.type || doc.name.split('.').pop()?.toUpperCase() || 'FILE';
            const isPdf = docType.toLowerCase().includes('pdf');
            const isExcel = docType.toLowerCase().includes('xlsx') || docType.toLowerCase().includes('xls');
            return (
              <div
                key={doc.id}
                className="group flex flex-col border border-border bg-card hover:bg-muted/10 transition-colors rounded-lg overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Thumbnail Header Placeholder */}
                <div className="h-32 bg-secondary/30 border-b border-border flex items-center justify-center relative group-hover:bg-secondary/50 transition-colors">
                  {isPdf ? (
                    <FileText className="h-10 w-10 text-red-400" />
                  ) : isExcel ? (
                    <FileBarChart className="h-10 w-10 text-green-500" />
                  ) : (
                    <FileImage className="h-10 w-10 text-blue-400" />
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-background/80 backdrop-blur border border-border text-foreground">
                    {docType}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/documents/${doc.id}${filters.keyword ? `?q=${encodeURIComponent(filters.keyword)}` : ''}`}>
                    <h3 className="font-semibold text-foreground text-base mb-1 truncate hover:text-primary cursor-pointer">
                      <HighlightedText text={doc.name} highlight={filters.keyword || ''} />
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                    {doc.department && (
                      <>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {doc.department}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {doc.size && <span>{doc.size}</span>}
                  </div>

                  {/* Matched Snippet */}
                  {(doc.snippet || doc.content) && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic mb-4 bg-muted/30 p-2 rounded border-l-2 border-primary/40">
                      "...<HighlightedText text={doc.snippet || doc.content || ''} highlight={filters.keyword || ''} />..."
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{doc.uploadedBy || doc.uploaded_by || 'Unknown'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(doc.uploadedAt || doc.uploaded_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => handleDownload(doc.id)}
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                        onClick={() => handleMove(doc)}
                        title="Move to folder"
                      >
                        <FolderTree className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Move Document Dialog */}
      {selectedDocument && (
        <MoveDocumentDialog
          documentId={selectedDocument.id}
          documentName={selectedDocument.name}
          currentFolderId={selectedDocument.folderId}
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          onSuccess={() => {
            fetchDocuments();
            setSelectedDocument(null);
          }}
        />
      )}
    </Card>
  );
}
