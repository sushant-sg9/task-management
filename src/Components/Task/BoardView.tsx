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

const TaskCard: React.FC<{
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}> = ({ task, onEdit, onDelete, isDragging = false }) => {
  const getCategoryColor = (category: string) => {
    return category === 'WORK' ? 'bg-blue-600' : 'bg-purple-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO-DO': return 'bg-gray-200 text-gray-800';
      case 'IN-PROGRESS': return 'bg-amber-200 text-amber-800';
      case 'COMPLETED': return 'bg-emerald-200 text-emerald-800';
      default: return 'bg-gray-200 text-gray-800';
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
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border-2 ${isDragging ? 'shadow-xl ring-2 ring-blue-500 border-blue-200' : 'border-gray-100'} cursor-grab`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getCategoryColor(task.category)} text-white`}>
          {task.category}
        </div>
        <div className="relative group">
          <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiMoreHorizontal size={16} />
          </button>
          <div className="absolute right-0 top-5 mt-1 w-40 bg-white shadow-xl rounded-lg hidden group-hover:block z-10 border border-gray-100">
            <div className="py-1">
              <button onClick={onEdit} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">Edit</button>
              <button onClick={onDelete} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium">Delete</button>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-gray-900 font-bold mb-2.5 line-clamp-2 text-base">{task.title}</h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center bg-gray-100 px-2.5 py-1.5 rounded-lg">
          <FiCalendar size={14} className="mr-1.5" />
          <span className="font-medium">{formatDate(task.dueDate)}</span>
        </div>
        
        {task.attachment && (
          <div className="flex items-center bg-gray-100 px-2.5 py-1.5 rounded-lg">
            <FiPaperclip size={14} className="mr-1.5" />
            <span className="font-medium">1</span>
          </div>
        )}
        
        <div className={`px-3 py-1.5 rounded-lg font-semibold ${getStatusColor(task.status)}`}>
          {task.status}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Droppable Column Component
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
    text: string;
    icon: string;
  };
}> = ({ id, tasks, onEdit, onDelete, onAddTask, color }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={`rounded-xl border-2 ${color.border} ${color.bg} overflow-hidden flex flex-col h-full transition-all duration-300 ${isOver ? 'ring-2 ring-blue-500 shadow-lg translate-y-[-2px]' : ''}`}
    >
      <div className={`${color.header} p-4 flex justify-between items-center border-b ${color.border}`}>
        <h3 className={`text-base font-bold ${color.text}`}>
          {id} <span className="text-sm ml-1.5 bg-white/30 px-2 py-1 rounded-lg">({tasks.length})</span>
        </h3>
        <button 
          onClick={onAddTask} 
          className={`p-2 rounded-full hover:bg-white/50 transition-colors ${color.icon}`}
        >
        </button>
      </div>
      
      <div 
        ref={setNodeRef}
        className="p-4 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]"
      >
        <SortableContext
          items={tasks.map(task => task.id!)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div 
                key={task.id}
                className="mb-4"
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
          <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
            <p className="font-medium">Drop tasks here</p>
            <p className="text-sm mt-1 text-gray-400">or click + to add new</p>
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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
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

    if (COLUMNS.includes(overId as any)) {
      const task = tasks.find(t => t.id === activeId);
      if (task && task.status !== overId) {
        setTasks(prev => 
          prev.map(t => t.id === activeId ? { ...t, status: overId as typeof COLUMNS[number] } : t)
        );
        
        try {
          await taskService.updateTask(activeId, { status: overId as typeof COLUMNS[number] });
        } catch (error) {
          console.error('Error updating task status:', error);
          loadTasks();
        }
      }
    } 
    else if (activeId !== overId) {
      const activeContainer = findContainerForTask(activeId);
      const overContainer = findContainerForTask(overId);
      
      if (activeContainer !== overContainer) {
        const newTasks = [...tasks];
        const activeTaskIndex = newTasks.findIndex(t => t.id === activeId);
        
        newTasks[activeTaskIndex] = {
          ...newTasks[activeTaskIndex],
          status: overContainer as typeof COLUMNS[number]
        };
        
        setTasks(newTasks);
        
        try {
          await taskService.updateTask(activeId, { status: overContainer as typeof COLUMNS[number] });
        } catch (error) {
          console.error('Error updating task status:', error);
          loadTasks();
        }
      } else {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        
        const newTasks = arrayMove(tasks, activeIndex, overIndex);
        setTasks(newTasks);
        
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
    'TO-DO': { 
      bg: 'bg-gray-50', 
      border: 'border-gray-300', 
      header: 'bg-gray-200',
      text: 'text-gray-800',
      icon: 'text-gray-700 hover:text-gray-900'
    },
    'IN-PROGRESS': { 
      bg: 'bg-amber-50', 
      border: 'border-amber-300', 
      header: 'bg-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-700 hover:text-amber-900'
    },
    'COMPLETED': { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-300', 
      header: 'bg-emerald-200',
      text: 'text-emerald-800',
      icon: 'text-emerald-700 hover:text-emerald-900'
    }
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