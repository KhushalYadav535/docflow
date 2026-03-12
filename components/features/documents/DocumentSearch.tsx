'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, Download, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Q4 Financial Report',
    type: 'PDF',
    size: '2.4 MB',
    uploadedBy: 'Sarah Chen',
    uploadedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Project Proposal',
    type: 'PDF',
    size: '1.8 MB',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Budget Spreadsheet',
    type: 'XLSX',
    size: '892 KB',
    uploadedBy: 'Emma Wilson',
    uploadedAt: '2024-01-13',
  },
  {
    id: '4',
    name: 'Team Meeting Notes',
    type: 'DOCX',
    size: '456 KB',
    uploadedBy: 'Sarah Chen',
    uploadedAt: '2024-01-12',
  },
  {
    id: '5',
    name: 'Brand Guidelines',
    type: 'PDF',
    size: '3.1 MB',
    uploadedBy: 'Design Team',
    uploadedAt: '2024-01-11',
  },
];

export function DocumentSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [documents, setDocuments] = useState(mockDocuments);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Document Library</h2>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="md:w-40 bg-background border-border text-foreground">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">All Types</SelectItem>
            <SelectItem value="pdf" className="text-foreground">PDF</SelectItem>
            <SelectItem value="docx" className="text-foreground">DOCX</SelectItem>
            <SelectItem value="xlsx" className="text-foreground">XLSX</SelectItem>
            <SelectItem value="jpg" className="text-foreground">JPG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-secondary/30">
              <TableHead className="text-foreground">Document Name</TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="text-foreground">Size</TableHead>
              <TableHead className="text-foreground">Uploaded By</TableHead>
              <TableHead className="text-foreground">Date</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow
                key={doc.id}
                className="border-border hover:bg-secondary/20 transition-colors"
              >
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                <TableCell className="text-muted-foreground">{doc.uploadedBy}</TableCell>
                <TableCell className="text-muted-foreground">{doc.uploadedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No documents found</p>
        </div>
      )}

      {/* Results Info */}
      <div className="mt-6 text-sm text-muted-foreground">
        Showing {filteredDocuments.length} of {documents.length} documents
      </div>
    </Card>
  );
}
