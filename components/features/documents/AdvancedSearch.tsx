'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchFilters {
  keyword: string;
  dateFrom: string;
  dateTo: string;
  documentType: string;
  department: string;
  uploadedBy: string;
  folder: string;
  status: string;
}

interface AdvancedSearchProps {
  onSearch?: (filters: SearchFilters) => void;
  resultsCount?: number;
  searchTime?: number;
}

export function AdvancedSearch({ onSearch, resultsCount = 0, searchTime = 0 }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    dateFrom: '',
    dateTo: '',
    documentType: '',
    department: '',
    uploadedBy: '',
    folder: '',
    status: '',
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      dateFrom: '',
      dateTo: '',
      documentType: '',
      department: '',
      uploadedBy: '',
      folder: '',
      status: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by name, keyword, or content..."
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Search
        </Button>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
        Advanced Search
        {activeFilterCount > 0 && (
          <span className="ml-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {activeFilterCount} active
          </span>
        )}
      </button>

      {/* Expandable Filters Panel */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Document Type</label>
              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="word">Word Document</option>
                <option value="image">Image</option>
                <option value="spreadsheet">Spreadsheet</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
              >
                <option value="">All Departments</option>
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
                <option value="legal">Legal</option>
                <option value="operations">Operations</option>
              </select>
            </div>

            {/* Uploaded By */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Uploaded By</label>
              <Input
                placeholder="User name or email"
                value={filters.uploadedBy}
                onChange={(e) => handleFilterChange('uploadedBy', e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
              >
                <option value="">All Status</option>
                <option value="indexed">Indexed</option>
                <option value="ocr-failed">OCR Failed</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {/* Folder */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground block mb-2">Folder</label>
              <Input
                placeholder="Select folder..."
                value={filters.folder}
                onChange={(e) => handleFilterChange('folder', e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              Apply Filters & Search
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent/10"
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Results Info */}
      {resultsCount > 0 && (
        <div className="text-sm text-muted-foreground">
          {resultsCount} results found in {searchTime}s
        </div>
      )}
    </div>
  );
}
