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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", dueDate: "" });

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
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handleTaskCreated = () => {
    window.location.reload();
  };

  const handleEditTask = (task: Task) => {
    console.log(task)
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };
  const handleFilterChange = (newFilters: { category: string; dueDate: string }) => {
    setFilters(newFilters);
  };
  
  

  const renderView = () => {
    switch (view) {
      case 'list':
        return <TaskList 
          onEditTask={handleEditTask} 
          searchQuery={searchQuery} 
          filters={filters} 
        />;
      case 'board':
        return <Board 
          onEditTask={handleEditTask} 
          searchQuery={searchQuery} 
          filters={filters} 
        />;
      default:
        return <TaskList 
          onEditTask={handleEditTask} 
          searchQuery={searchQuery} 
          filters={filters} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onViewChange={handleViewChange} currentView={view}   onSearch={handleSearch}  onFilterChange={handleFilterChange}  />
      
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