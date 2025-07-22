import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkspaceCard } from './WorkspaceCard';
import type { WorkspacePhase, WorkspaceItem, DragDropContext } from '@/types';

interface PhaseColumnProps {
  phase: WorkspacePhase;
  onCreateItem: (itemData: Partial<WorkspaceItem>) => void;
  dragContext: DragDropContext;
}

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  phase,
  onCreateItem,
  dragContext,
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
  });

  const handleQuickAdd = (): void => {
    if (quickAddTitle.trim()) {
      onCreateItem({
        title: quickAddTitle.trim(),
        type: 'task',
        priority: 'medium',
      });
      setQuickAddTitle('');
      setShowQuickAdd(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleQuickAdd();
    } else if (e.key === 'Escape') {
      setShowQuickAdd(false);
      setQuickAddTitle('');
    }
  };

  const getStatusIcon = (
    status: WorkspaceItem['status']
  ): React.ReactElement => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className='h-3 w-3 text-green-600' />;
      case 'in_progress':
        return <Clock className='h-3 w-3 text-blue-600' />;
      case 'review':
        return <AlertTriangle className='h-3 w-3 text-yellow-600' />;
      default:
        return <div className='h-3 w-3 rounded-full bg-gray-300' />;
    }
  };

  const getPriorityColor = (priority: WorkspaceItem['priority']): string => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isWipLimitExceeded =
    phase.wip_limit && phase.items.length > phase.wip_limit;
  const isActive = dragContext.overId === phase.id;

  return (
    <div className='min-w-[300px] max-w-[300px]'>
      <Card
        ref={setNodeRef}
        className={`h-full ${
          isOver ? 'ring-2 ring-primary ring-opacity-50' : ''
        } ${isActive ? 'bg-primary/5' : ''} transition-all duration-200`}
      >
        {/* Phase Header */}
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: phase.color }}
              />
              <h3 className='font-semibold'>{phase.name}</h3>
              <span className='text-sm text-muted-foreground'>
                {phase.items.length}
                {phase.wip_limit && `/${phase.wip_limit}`}
              </span>
            </div>

            <div className='flex items-center space-x-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowQuickAdd(true)}
                className='h-6 w-6 p-0'
              >
                <Plus className='h-3 w-3' />
              </Button>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <MoreHorizontal className='h-3 w-3' />
              </Button>
            </div>
          </div>

          {phase.description && (
            <p className='text-xs text-muted-foreground'>{phase.description}</p>
          )}

          {/* WIP Limit Warning */}
          {isWipLimitExceeded && (
            <div className='flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded'>
              <AlertTriangle className='h-3 w-3' />
              <span>WIP limit exceeded</span>
            </div>
          )}
        </CardHeader>

        {/* Phase Content */}
        <CardContent className='pt-0 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto'>
          {/* Quick Add Form */}
          {showQuickAdd && (
            <div className='space-y-2'>
              <input
                type='text'
                placeholder='Enter item title...'
                value={quickAddTitle}
                onChange={e => setQuickAddTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className='w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                autoFocus
              />
              <div className='flex space-x-2'>
                <Button size='sm' onClick={handleQuickAdd}>
                  Add
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickAddTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Sortable Items */}
          <SortableContext
            items={phase.items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {phase.items.map(item => (
              <WorkspaceCard
                key={item.id}
                item={item}
                onEdit={() => {
                  // Handle edit
                }}
              />
            ))}
          </SortableContext>

          {/* Empty State */}
          {phase.items.length === 0 && !showQuickAdd && (
            <div className='text-center py-8 text-muted-foreground'>
              <div className='mb-2'>No items yet</div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowQuickAdd(true)}
                className='text-xs'
              >
                <Plus className='mr-1 h-3 w-3' />
                Add item
              </Button>
            </div>
          )}

          {/* Drop Zone Indicator */}
          {isOver && (
            <div className='border-2 border-dashed border-primary rounded-lg p-4 text-center text-primary'>
              Drop item here
            </div>
          )}
        </CardContent>

        {/* Phase Footer */}
        <div className='px-4 py-3 border-t'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <div className='flex items-center space-x-2'>
              {/* Status Summary */}
              <div className='flex items-center space-x-1'>
                {getStatusIcon('completed')}
                <span>
                  {
                    phase.items.filter(item => item.status === 'completed')
                      .length
                  }
                </span>
              </div>
              <div className='flex items-center space-x-1'>
                {getStatusIcon('in_progress')}
                <span>
                  {
                    phase.items.filter(item => item.status === 'in_progress')
                      .length
                  }
                </span>
              </div>
            </div>

            {/* Priority Summary */}
            <div className='flex items-center space-x-1'>
              {['urgent', 'high'].map(priority => {
                const count = phase.items.filter(
                  item => item.priority === priority
                ).length;
                if (count > 0) {
                  return (
                    <span
                      key={priority}
                      className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(
                        priority as WorkspaceItem['priority']
                      )}`}
                    >
                      {count}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
