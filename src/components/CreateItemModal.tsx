import React, { useState } from 'react';
import {
  X,
  FileText,
  Settings,
  CheckSquare,
  File,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WorkspacePhase, WorkspaceItem, DocumentType } from '@/types';

interface CreateItemModalProps {
  phases: WorkspacePhase[];
  onClose: () => void;
  onCreateItem: (phaseId: string, itemData: Partial<WorkspaceItem>) => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  phases,
  onClose,
  onCreateItem,
}) => {
  const [formData, setFormData] = useState<Partial<WorkspaceItem>>({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    status: 'draft',
    tags: [],
  });
  const [selectedPhaseId, setSelectedPhaseId] = useState(phases[0]?.id || '');
  const [tagInput, setTagInput] = useState('');

  const itemTypes = [
    { value: 'task', label: 'Task', icon: CheckSquare },
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'rule', label: 'Rule', icon: Settings },
    { value: 'template', label: 'Template', icon: File },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-blue-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
  ];

  const documentTypes: DocumentType[] = [
    'README',
    'AGENTS_MD',
    'CURSOR_RULES',
    'WORKFLOW',
    'TESTING',
    'SECURITY',
    'PERFORMANCE',
  ];

  const ruleTypes = ['CLAUDE.md', '.cursorrules', 'AGENTS.md'];

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!formData.title?.trim() || !selectedPhaseId) return;

    onCreateItem(selectedPhaseId, formData);
  };

  const handleAddTag = (): void => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Create New Item</CardTitle>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='title'>Title *</Label>
                <Input
                  id='title'
                  value={formData.title || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder='Enter item title...'
                  required
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Enter item description...'
                  rows={3}
                />
              </div>
            </div>

            {/* Type Selection */}
            <div>
              <Label>Type *</Label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-2'>
                {itemTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      type='button'
                      variant={
                        formData.type === type.value ? 'default' : 'outline'
                      }
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          type: type.value as WorkspaceItem['type'],
                        }))
                      }
                      className='flex items-center justify-center p-3 h-auto'
                    >
                      <Icon className='h-4 w-4 mr-2' />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Type-Specific Fields */}
            {formData.type === 'document' && (
              <div>
                <Label htmlFor='document-type'>Document Type</Label>
                <select
                  id='document-type'
                  value={formData.document_type || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      document_type:
                        (e.target.value as DocumentType) || undefined,
                    }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  <option value=''>Select document type...</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.type === 'rule' && (
              <div>
                <Label htmlFor='rule-type'>Rule Type</Label>
                <select
                  id='rule-type'
                  value={formData.rule_type || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      rule_type:
                        (e.target.value as
                          | 'CLAUDE.md'
                          | '.cursorrules'
                          | 'AGENTS.md') || undefined,
                    }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  <option value=''>Select rule type...</option>
                  {ruleTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Phase Selection */}
            <div>
              <Label htmlFor='phase'>Phase *</Label>
              <select
                id='phase'
                value={selectedPhaseId}
                onChange={e => setSelectedPhaseId(e.target.value)}
                className='w-full p-2 border rounded-md'
                required
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority and Status */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='priority'>Priority</Label>
                <select
                  id='priority'
                  value={formData.priority || 'medium'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      priority: e.target.value as WorkspaceItem['priority'],
                    }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor='status'>Status</Label>
                <select
                  id='status'
                  value={formData.status || 'draft'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: e.target.value as WorkspaceItem['status'],
                    }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor='due-date'>Due Date</Label>
              <Input
                id='due-date'
                type='date'
                value={
                  formData.due_date
                    ? formData.due_date.toISOString().split('T')[0]
                    : ''
                }
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    due_date: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor='tags'>Tags</Label>
              <div className='space-y-2'>
                <div className='flex space-x-2'>
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder='Add tag...'
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <Tag className='h-4 w-4' />
                  </Button>
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className='inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-800'
                      >
                        {tag}
                        <button
                          type='button'
                          onClick={() => handleRemoveTag(tag)}
                          className='ml-1 text-gray-500 hover:text-gray-700'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='flex justify-end space-x-3 pt-6 border-t'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit'>Create Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
