import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Plus,
  Settings,
  Users,
  BarChart3,
  Filter,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhaseColumn } from './PhaseColumn';
import { WorkspaceCard } from './WorkspaceCard';
import { CreateItemModal } from './CreateItemModal';
import type {
  ProjectWorkspace,
  WorkspacePhase,
  WorkspaceItem,
  DragDropContext,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceBoardProps {
  workspace: ProjectWorkspace;
  onBack: () => void;
}

export const WorkspaceBoard: React.FC<WorkspaceBoardProps> = ({
  workspace: initialWorkspace,
  onBack,
}) => {
  const [workspace, setWorkspace] =
    useState<ProjectWorkspace>(initialWorkspace);
  const [dragContext, setDragContext] = useState<DragDropContext>({
    activeItem: null,
    overId: null,
    activePhase: null,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize with default phases if empty
  useEffect(() => {
    if (workspace.phases.length === 0) {
      const defaultPhases: WorkspacePhase[] = [
        {
          id: 'planning',
          name: 'Planning',
          description: 'Initial project planning and requirements',
          color: '#3b82f6',
          position: 0,
          wip_limit: 5,
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'development',
          name: 'Development',
          description: 'Active development and implementation',
          color: '#f59e0b',
          position: 1,
          wip_limit: 3,
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'testing',
          name: 'Testing',
          description: 'Quality assurance and testing',
          color: '#8b5cf6',
          position: 2,
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'completed',
          name: 'Completed',
          description: 'Finished and approved items',
          color: '#10b981',
          position: 3,
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Add some sample items
      const sampleItems: WorkspaceItem[] = [
        {
          id: uuidv4(),
          title: 'Project Requirements Document',
          description: 'Define project scope and requirements',
          type: 'document',
          phase_id: 'planning',
          position: 0,
          document_type: 'README',
          status: 'draft',
          priority: 'high',
          tags: ['requirements', 'planning'],
          dependencies: [],
          metadata: {
            created_by: 'user-1',
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          title: 'AGENTS.md Configuration',
          description: 'AI agent configuration file',
          type: 'rule',
          phase_id: 'planning',
          position: 1,
          rule_type: 'AGENTS.md',
          status: 'in_progress',
          priority: 'medium',
          tags: ['ai', 'configuration'],
          dependencies: [],
          metadata: {
            created_by: 'user-1',
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          title: 'API Documentation',
          description: 'Document REST API endpoints',
          type: 'document',
          phase_id: 'development',
          position: 0,
          document_type: 'README',
          status: 'in_progress',
          priority: 'high',
          tags: ['api', 'documentation'],
          dependencies: [],
          metadata: {
            created_by: 'user-1',
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Assign items to phases
      defaultPhases[0].items = sampleItems.filter(
        item => item.phase_id === 'planning'
      );
      defaultPhases[1].items = sampleItems.filter(
        item => item.phase_id === 'development'
      );

      setWorkspace(prev => ({
        ...prev,
        phases: defaultPhases,
      }));
    }
  }, [workspace.phases.length]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeItem = findItemById(active.id as string);
      const activePhase = findPhaseByItemId(active.id as string);

      setDragContext({
        activeItem,
        overId: null,
        activePhase,
      });
    },
    [workspace]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setDragContext(prev => ({
      ...prev,
      overId: over?.id as string | null,
    }));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setDragContext({ activeItem: null, overId: null, activePhase: null });
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeItem = findItemById(activeId);
      if (!activeItem) return;

      // Find source and destination phases
      const sourcePhase = findPhaseByItemId(activeId);
      const destPhase = findPhaseById(overId) || findPhaseByItemId(overId);

      if (!sourcePhase || !destPhase) return;

      setWorkspace(prev => {
        const newPhases = [...prev.phases];

        if (sourcePhase.id === destPhase.id) {
          // Same phase - reorder items
          const phaseIndex = newPhases.findIndex(p => p.id === sourcePhase.id);
          const items = [...newPhases[phaseIndex].items];
          const oldIndex = items.findIndex(item => item.id === activeId);
          const newIndex = items.findIndex(item => item.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedItems = arrayMove(items, oldIndex, newIndex);
            newPhases[phaseIndex] = {
              ...newPhases[phaseIndex],
              items: reorderedItems.map((item, index) => ({
                ...item,
                position: index,
              })),
            };
          }
        } else {
          // Different phases - move item
          const sourcePhaseIndex = newPhases.findIndex(
            p => p.id === sourcePhase.id
          );
          const destPhaseIndex = newPhases.findIndex(
            p => p.id === destPhase.id
          );

          // Remove from source
          const sourceItems = newPhases[sourcePhaseIndex].items.filter(
            item => item.id !== activeId
          );

          // Add to destination
          const destItems = [...newPhases[destPhaseIndex].items];
          const updatedItem = {
            ...activeItem,
            phase_id: destPhase.id,
            position: destItems.length,
          };
          destItems.push(updatedItem);

          newPhases[sourcePhaseIndex] = {
            ...newPhases[sourcePhaseIndex],
            items: sourceItems.map((item, index) => ({
              ...item,
              position: index,
            })),
          };

          newPhases[destPhaseIndex] = {
            ...newPhases[destPhaseIndex],
            items: destItems,
          };
        }

        return {
          ...prev,
          phases: newPhases,
        };
      });

      setDragContext({ activeItem: null, overId: null, activePhase: null });
    },
    [workspace]
  );

  const findItemById = (id: string): WorkspaceItem | null => {
    for (const phase of workspace.phases) {
      const item = phase.items.find(item => item.id === id);
      if (item) return item;
    }
    return null;
  };

  const findPhaseById = (id: string): WorkspacePhase | null => {
    return workspace.phases.find(phase => phase.id === id) || null;
  };

  const findPhaseByItemId = (itemId: string): WorkspacePhase | null => {
    for (const phase of workspace.phases) {
      if (phase.items.some(item => item.id === itemId)) {
        return phase;
      }
    }
    return null;
  };

  const handleCreateItem = (
    phaseId: string,
    itemData: Partial<WorkspaceItem>
  ): void => {
    const newItem: WorkspaceItem = {
      id: uuidv4(),
      title: itemData.title || 'New Item',
      description: itemData.description,
      type: itemData.type || 'task',
      phase_id: phaseId,
      position: 0,
      status: 'draft',
      priority: itemData.priority || 'medium',
      tags: itemData.tags || [],
      dependencies: [],
      metadata: {
        created_by: 'user-1',
      },
      created_at: new Date(),
      updated_at: new Date(),
      ...itemData,
    };

    setWorkspace(prev => {
      const newPhases = [...prev.phases];
      const phaseIndex = newPhases.findIndex(p => p.id === phaseId);

      if (phaseIndex !== -1) {
        const phase = newPhases[phaseIndex];
        newPhases[phaseIndex] = {
          ...phase,
          items: [newItem, ...phase.items].map((item, index) => ({
            ...item,
            position: index,
          })),
        };
      }

      return {
        ...prev,
        phases: newPhases,
      };
    });
  };

  const getPhaseStats = (
    phase: WorkspacePhase
  ): {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  } => {
    const total = phase.items.length;
    const completed = phase.items.filter(
      item => item.status === 'completed'
    ).length;
    const inProgress = phase.items.filter(
      item => item.status === 'in_progress'
    ).length;
    const overdue = phase.items.filter(
      item =>
        item.due_date &&
        item.due_date < new Date() &&
        item.status !== 'completed'
    ).length;

    return { total, completed, inProgress, overdue };
  };

  const filteredPhases = workspace.phases.map(phase => ({
    ...phase,
    items:
      filterStatus === 'all'
        ? phase.items
        : phase.items.filter(item => item.status === filterStatus),
  }));

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' onClick={onBack} size='sm'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>{workspace.name}</h1>
            {workspace.description && (
              <p className='text-muted-foreground'>{workspace.description}</p>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-3'>
          <Button variant='outline' size='sm'>
            <Filter className='mr-2 h-4 w-4' />
            Filter
          </Button>
          <Button variant='outline' size='sm'>
            <BarChart3 className='mr-2 h-4 w-4' />
            Analytics
          </Button>
          <Button variant='outline' size='sm'>
            <Users className='mr-2 h-4 w-4' />
            Share
          </Button>
          <Button variant='outline' size='sm'>
            <Settings className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Workspace Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {workspace.phases.map(phase => {
          const stats = getPhaseStats(phase);
          return (
            <Card key={phase.id}>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p
                      className='text-sm font-medium'
                      style={{ color: phase.color }}
                    >
                      {phase.name}
                    </p>
                    <p className='text-2xl font-bold'>{stats.total}</p>
                  </div>
                  <div className='text-right text-sm text-muted-foreground'>
                    <div>{stats.completed} completed</div>
                    {stats.overdue > 0 && (
                      <div className='text-red-600 flex items-center'>
                        <AlertCircle className='mr-1 h-3 w-3' />
                        {stats.overdue} overdue
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className='flex space-x-6 overflow-x-auto pb-6'>
          {filteredPhases.map(phase => (
            <PhaseColumn
              key={phase.id}
              phase={phase}
              onCreateItem={(itemData: Partial<WorkspaceItem>) =>
                handleCreateItem(phase.id, itemData)
              }
              dragContext={dragContext}
            />
          ))}
        </div>

        <DragOverlay>
          {dragContext.activeItem ? (
            <WorkspaceCard
              item={dragContext.activeItem}
              isDragging={true}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Quick Add */}
      <Card className='border-dashed'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <Plus className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
            <p className='text-muted-foreground mb-4'>
              Add new items to your workspace
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Create Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Item Modal */}
      {showCreateModal && (
        <CreateItemModal
          phases={workspace.phases}
          onClose={() => setShowCreateModal(false)}
          onCreateItem={(phaseId: string, itemData: Partial<WorkspaceItem>) => {
            handleCreateItem(phaseId, itemData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
