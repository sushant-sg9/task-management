import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import Navbar from './Navbar';
import TaskList from '../Task/ListView';
import Board from '../Task/BoardView';
import CreateTaskModal from '../Task/CreateTaskModal';
import { Task } from '../../services/taskService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'board'>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const handleOpenAddTaskModal = () => {
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openAddTaskModal', handleOpenAddTaskModal);
    return () => {
      window.removeEventListener('openAddTaskModal', handleOpenAddTaskModal);
    };
  }, []);

  const handleViewChange = (newView: 'list' | 'board') => {
    setView(newView);
  };

  const handleTaskCreated = () => {
    // Refresh the task list or board view
    window.location.reload();
  };

  const handleEditTask = (task: Task) => {
    console.log(task)
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const renderView = () => {
    switch (view) {
      case 'list':
        return <TaskList onEditTask={handleEditTask} />;
      case 'board':
        return <Board onEditTask={handleEditTask} />;
      default:
        return <TaskList onEditTask={handleEditTask} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onViewChange={handleViewChange} currentView={view} />
      
      <main className="container mx-auto py-6">
        {renderView()}
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreated={handleTaskCreated}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;