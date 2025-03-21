import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { taskService, Task } from '../../services/taskService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { FiPlusCircle, FiMoreHorizontal, FiCalendar, FiPaperclip } from 'react-icons/fi';
import { format } from 'date-fns';

// TaskCard with Sortable functionality
const SortableTaskCard: React.FC<{
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id!,
    data: { task }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
};

// Improved TaskCard component
const TaskCard: React.FC<{
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}> = ({ task, onEdit, onDelete, isDragging = false }) => {
  const getCategoryColor = (category: string) => {
    return category === 'WORK' ? 'bg-blue-500' : 'bg-purple-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO-DO': return 'bg-gray-200 text-gray-700';
      case 'IN-PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-100 ${isDragging ? 'shadow-lg ring-2 ring-blue-400 opacity-90' : ''} cursor-grab`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(task.category)} text-white`}>
          {task.category}
        </div>
        <div className="relative group">
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
            <FiMoreHorizontal size={16} />
          </button>
          <div className="absolute right-0 top-5 mt-1 w-36 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
            <div className="py-1">
              <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
              <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</button>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-gray-900 font-medium mb-2 line-clamp-2">{task.title}</h3>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <FiCalendar size={14} className="mr-1" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        
        {task.attachment && (
          <div className="flex items-center">
            <FiPaperclip size={14} className="mr-1" />
            <span>1</span>
          </div>
        )}
        
        <div className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </div>
      </div>
    </motion.div>
  );
};

// Droppable Column Component
const DroppableColumn: React.FC<{
  id: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: () => void;
  color: {
    bg: string;
    border: string;
    header: string;
  };
}> = ({ id, tasks, onEdit, onDelete, onAddTask, color }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={`rounded-lg border ${color.border} ${color.bg} overflow-hidden flex flex-col h-full ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className={`${color.header} p-4 flex justify-between items-center`}>
        <h3 className="text-base font-semibold">
          {id} <span className="text-sm text-gray-500 ml-1">({tasks.length})</span>
        </h3>
        <button 
          onClick={onAddTask} 
          className="p-1 rounded-full hover:bg-white/50 transition-colors"
        >
          <FiPlusCircle size={18} className="text-gray-600" />
        </button>
      </div>
      
      <div 
        ref={setNodeRef}
        className="p-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]"
      >
        <SortableContext
          items={tasks.map(task => task.id!)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div 
                key={task.id}
                className="mb-3"
                layout
              >
                <SortableTaskCard
                  task={task}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id!)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
            Drag tasks here
          </div>
        )}
      </div>
    </div>
  );
};

interface BoardViewProps {
  onEditTask: (task: Task) => void;
  onAddTask?: (status: string) => void;
}

const COLUMNS = ['TO-DO', 'IN-PROGRESS', 'COMPLETED'] as const;

const BoardView: React.FC<BoardViewProps> = ({ onEditTask, onAddTask }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    category: '',
    searchTerm: ''
  });

  // Enhanced sensors configuration for better drag and drop behavior
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move 8px before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 200ms for touch devices
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const userTasks = await taskService.getUserTasks(user?.uid || '');
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const findContainerForTask = (taskId: string): string => {
    const task = tasks.find(t => t.id === taskId);
    return task?.status || '';
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as any)) {
      const task = tasks.find(t => t.id === activeId);
      if (task && task.status !== overId) {
        // Optimistically update UI
        setTasks(prev => 
          prev.map(t => t.id === activeId ? { ...t, status: overId as typeof COLUMNS[number] } : t)
        );
        
        // Update in database
        try {
          await taskService.updateTask(activeId, { status: overId as typeof COLUMNS[number] });
        } catch (error) {
          console.error('Error updating task status:', error);
          // Rollback optimistic update if it fails
          loadTasks();
        }
      }
    } 
    // Check if dragging a task over another task
    else if (activeId !== overId) {
      const activeContainer = findContainerForTask(activeId);
      const overContainer = findContainerForTask(overId);
      
      if (activeContainer !== overContainer) {
        // Moving to a different container/column
        const newTasks = [...tasks];
        const activeTaskIndex = newTasks.findIndex(t => t.id === activeId);
        const overTaskIndex = newTasks.findIndex(t => t.id === overId);
        
        // Update the task's status
        newTasks[activeTaskIndex] = {
          ...newTasks[activeTaskIndex],
          status: overContainer as typeof COLUMNS[number]
        };
        
        // Move the task to the right position
        setTasks(newTasks);
        
        // Update in database
        try {
          await taskService.updateTask(activeId, { status: overContainer as typeof COLUMNS[number] });
        } catch (error) {
          console.error('Error updating task status:', error);
          loadTasks();
        }
      } else {
        // Reordering within the same column
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        
        // Update array order
        const newTasks = arrayMove(tasks, activeIndex, overIndex);
        setTasks(newTasks);
        
        // Here you would update the order in the database if needed
        // This would require adding an 'order' field to your tasks
        // and updating the backend to respect this order
      }
    }
    
    setActiveTask(null);
  };

  const getColumnTasks = (status: typeof COLUMNS[number]) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status;
      const matchesCategory = !filter.category || task.category === filter.category;
      const matchesSearch = !filter.searchTerm || 
        task.title.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(filter.searchTerm.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const columnColors = {
    'TO-DO': { bg: 'bg-gray-50', border: 'border-gray-200', header: 'bg-gray-100' },
    'IN-PROGRESS': { bg: 'bg-yellow-50', border: 'border-yellow-200', header: 'bg-yellow-100' },
    'COMPLETED': { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-100' }
  };

  return (
    <div className="container mx-auto px-4 py-6">
     

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((status) => {
            const columnTasks = getColumnTasks(status);
            const colors = columnColors[status];
            
            return (
              <DroppableColumn
                key={status}
                id={status}
                tasks={columnTasks}
                onEdit={onEditTask}
                onDelete={handleDeleteTask}
                onAddTask={() => onAddTask?.(status)}
                color={colors}
              />
            );
          })}
        </div>
        
        <DragOverlay>
          {activeTask && (
            <div className="transform-none">
              <TaskCard 
                task={activeTask} 
                onEdit={() => {}} 
                onDelete={() => {}} 
                isDragging={true} 
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BoardView;