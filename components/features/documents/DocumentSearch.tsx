'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  folder_id?: string;
  folderId?: string;
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
  const term = highlight.trim();
  if (!term) return <span>{text}</span>;

  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  const parts = text.split(regex);
  const lowerTerm = term.toLowerCase();

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerTerm ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 rounded px-1">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export function DocumentSearch() {
  const router = useRouter();
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
    const keywordFromUrl = new URLSearchParams(window.location.search).get('q');
    if (!keywordFromUrl) return;

    setFilters((prev: any) => {
      if (prev.keyword === keywordFromUrl) return prev;
      return { ...prev, keyword: keywordFromUrl };
    });
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

      const data = await apiRequest<Document[] | { results?: Document[] }>(
        `/documents/search?${params.toString()}`,
        { method: 'GET' }
      );
      const endTime = Date.now();
      setSearchTime((endTime - startTime) / 1000);
      const normalizedResults = Array.isArray(data) ? data : data?.results || [];
      const keyword = String(filters.keyword || '').trim().toLowerCase();

      const rankedResults = !keyword
        ? normalizedResults
        : [...normalizedResults].sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            const score = (name: string) => {
              if (name === keyword) return 0;
              if (name.startsWith(keyword)) return 1;
              if (name.includes(keyword)) return 2;
              return 3;
            };

            const scoreDiff = score(aName) - score(bName);
            if (scoreDiff !== 0) return scoreDiff;
            return aName.localeCompare(bName);
          });

      setDocuments(rankedResults);
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

  const handleMove = (doc: Document) => {
    setSelectedDocument({
      id: doc.id,
      name: doc.name,
      folderId: doc.folderId || doc.folder_id,
    });
    setMoveDialogOpen(true);
  };

  const openDocumentPreview = (docId: string) => {
    const query = filters.keyword ? `?q=${encodeURIComponent(filters.keyword)}` : '';
    router.push(`/documents/${docId}${query}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-[0_18px_50px_rgba(15,15,20,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <h2 className="mb-6 text-xl font-semibold text-foreground dark:text-white">Document Library</h2>

      {/* Advanced Search Component */}
      <div className="mb-6">
        <AdvancedSearch 
          onSearch={setFilters} 
          resultsCount={documents.length} 
          searchTime={searchTime}
          initialKeyword={filters.keyword || ''}
        />
      </div>

      {/* Result Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/80 dark:border-white/10 dark:bg-white/5">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border-2 border-dashed border-border/70 py-12 text-center dark:border-white/12">
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
                role="button"
                tabIndex={0}
                onClick={() => openDocumentPreview(doc.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDocumentPreview(doc.id);
                  }
                }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/80 shadow-[0_12px_35px_rgba(15,15,20,0.06)] transition-colors hover:border-primary/20 hover:bg-accent/20 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_35px_rgba(0,0,0,0.18)] dark:hover:bg-white/7"
              >
                {/* Thumbnail Header Placeholder */}
                <div className="relative flex h-32 items-center justify-center border-b border-border/70 bg-muted/30 transition-colors group-hover:bg-muted/45 dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                  {isPdf ? (
                    <FileText className="h-10 w-10 text-red-400" />
                  ) : isExcel ? (
                    <FileBarChart className="h-10 w-10 text-green-500" />
                  ) : (
                    <FileImage className="h-10 w-10 text-blue-400" />
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-2 right-2 rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur dark:border-white/10 dark:bg-black/30 dark:text-white">
                    {docType}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <Link
                    href={`/documents/${doc.id}${filters.keyword ? `?q=${encodeURIComponent(filters.keyword)}` : ''}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="mb-1 cursor-pointer truncate text-base font-semibold text-foreground hover:text-primary dark:text-white">
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
                    <p className="mb-4 line-clamp-2 rounded-xl border-l-2 border-primary/40 bg-muted/30 p-2 text-xs italic text-muted-foreground dark:bg-white/5">
                      "...<HighlightedText text={doc.snippet || doc.content || ''} highlight={filters.keyword || ''} />..."
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground dark:border-white/10">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{doc.uploadedBy || doc.uploaded_by || 'Unknown'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(doc.uploadedAt || doc.uploaded_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownload(doc.id);
                        }}
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMove(doc);
                        }}
                        title="Move to folder"
                      >
                        <FolderTree className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
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
