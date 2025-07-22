import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FileText,
  Settings,
  CheckSquare,
  File,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  Flag,
  GripVertical,
  MoreHorizontal,
  Edit3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WorkspaceItem } from '@/types';

interface WorkspaceCardProps {
  item: WorkspaceItem;
  isDragging?: boolean;
  onEdit: (item: WorkspaceItem) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  item,
  isDragging = false,
  onEdit,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } =
    useSortable({
      id: item.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeIcon = (): React.ReactElement => {
    switch (item.type) {
      case 'document':
        return <FileText className='h-4 w-4' />;
      case 'rule':
        return <Settings className='h-4 w-4' />;
      case 'task':
        return <CheckSquare className='h-4 w-4' />;
      case 'template':
        return <File className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  const getStatusIcon = (): React.ReactElement => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle2 className='h-3 w-3 text-green-600' />;
      case 'in_progress':
        return <Clock className='h-3 w-3 text-blue-600' />;
      case 'review':
        return <AlertCircle className='h-3 w-3 text-yellow-600' />;
      default:
        return <div className='h-3 w-3 rounded-full bg-gray-300' />;
    }
  };

  const getPriorityColor = (): string => {
    switch (item.priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300';
    }
  };

  const getPriorityBadgeColor = (): string => {
    switch (item.priority) {
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

  const isOverdue =
    item.due_date && item.due_date < new Date() && item.status !== 'completed';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        cursor-pointer transition-all duration-200 border-l-4
        ${getPriorityColor()}
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
        ${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''}
        hover:shadow-md group
      `}
      {...attributes}
    >
      <CardContent className='p-3 space-y-2'>
        {/* Card Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2 flex-1'>
            <div className='text-muted-foreground'>{getTypeIcon()}</div>
            <h4 className='font-medium text-sm leading-tight flex-1 min-w-0'>
              {item.title}
            </h4>
          </div>

          <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={e => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Edit3 className='h-3 w-3' />
            </Button>
            <div
              {...listeners}
              className='cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100'
            >
              <GripVertical className='h-3 w-3 text-muted-foreground' />
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className='text-xs text-muted-foreground line-clamp-2'>
            {item.description}
          </p>
        )}

        {/* Type-specific Info */}
        {item.type === 'rule' && item.rule_type && (
          <div className='text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded'>
            {item.rule_type}
          </div>
        )}

        {item.type === 'document' && item.document_type && (
          <div className='text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded'>
            {item.document_type}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {item.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className='inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700'
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className='text-xs text-muted-foreground'>
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Row */}
        <div className='flex items-center justify-between text-xs'>
          <div className='flex items-center space-x-2'>
            {/* Status */}
            <div className='flex items-center space-x-1'>
              {getStatusIcon()}
              <span className='text-muted-foreground capitalize'>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            {/* Priority */}
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs ${getPriorityBadgeColor()}`}
            >
              <Flag className='mr-1 h-2 w-2' />
              {item.priority}
            </span>
          </div>

          {/* Due Date / Assignee */}
          <div className='flex items-center space-x-1'>
            {isOverdue && (
              <div className='flex items-center text-red-600'>
                <AlertCircle className='h-3 w-3 mr-1' />
                <span>Overdue</span>
              </div>
            )}

            {item.due_date && !isOverdue && (
              <div className='flex items-center text-muted-foreground'>
                <Calendar className='h-3 w-3 mr-1' />
                <span>{item.due_date.toLocaleDateString()}</span>
              </div>
            )}

            {item.assignee_id && (
              <div className='flex items-center text-muted-foreground'>
                <User className='h-3 w-3' />
              </div>
            )}
          </div>
        </div>

        {/* Dependencies Indicator */}
        {item.dependencies.length > 0 && (
          <div className='text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded'>
            Depends on {item.dependencies.length} item
            {item.dependencies.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Progress Bar for Tasks */}
        {item.type === 'task' && item.status === 'in_progress' && (
          <div className='w-full bg-gray-200 rounded-full h-1'>
            <div
              className='bg-blue-600 h-1 rounded-full transition-all duration-300'
              style={{ width: '60%' }} // This would be calculated based on actual progress
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
