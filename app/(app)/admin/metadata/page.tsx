'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface MetadataField {
  id: string;
  name: string;
  field_type: string;
  fieldType?: string;
  is_required: boolean;
  isRequired?: boolean;
  category?: string;
}

export default function MetadataManagementPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [fields, setFields] = useState<MetadataField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MetadataField | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    required: boolean;
    category: string;
  }>({
    name: '',
    type: 'text',
    required: false,
    category: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchFields();
  }, [isAuthenticated, router]);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<MetadataField[]>('/metadata-fields', { method: 'GET' });
      setFields(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch metadata fields', error);
      toast.error('Failed to load metadata fields');
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    try {
      if (selectedField) {
        await apiRequest(`/metadata-fields/${selectedField.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            fieldType: formData.type,
            isRequired: formData.required,
            category: formData.category || null,
          }),
        });
        toast.success('Metadata field updated');
        setIsEditOpen(false);
      } else {
        await apiRequest('/metadata-fields', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            fieldType: formData.type,
            isRequired: formData.required,
            category: formData.category || null,
          }),
        });
        toast.success('Metadata field created');
        setIsAddOpen(false);
      }
      resetForm();
      fetchFields();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save metadata field');
    }
  };

  const openEditModal = (field: MetadataField) => {
    setSelectedField(field);
    setFormData({
      name: field.name,
      type: field.field_type || field.fieldType || 'text',
      required: field.is_required !== undefined ? field.is_required : (field.isRequired || false),
      category: field.category || '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metadata field?')) return;
    try {
      await apiRequest(`/metadata-fields/${id}`, { method: 'DELETE' });
      toast.success('Metadata field deleted');
      fetchFields();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete metadata field');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'text', required: false, category: '' });
    setSelectedField(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metadata Fields</h1>
          <p className="text-muted-foreground mt-2">Define custom metadata fields for documents</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Metadata Field</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Field Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">Field Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-background border-border"
                  placeholder="e.g., Invoices, Contracts"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="required" className="text-foreground cursor-pointer">Required field</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">Create Field</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground">Field Name</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Category</TableHead>
                <TableHead className="text-foreground">Required</TableHead>
                <TableHead className="text-right text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No metadata fields found
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((field) => (
                  <TableRow key={field.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{field.name}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {field.field_type || field.fieldType || 'text'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{field.category || 'All'}</TableCell>
                    <TableCell>
                      {(field.is_required !== undefined ? field.is_required : field.isRequired) ? (
                        <span className="text-green-500">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(field)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(field.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Metadata Field</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-foreground">Field Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type" className="text-foreground">Field Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-foreground">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-required"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="edit-required" className="text-foreground cursor-pointer">Required field</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground">Update Field</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
