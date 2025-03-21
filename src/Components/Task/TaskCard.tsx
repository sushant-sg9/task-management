"use client"

import React from 'react';
import { Task } from '../../services/taskService';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className={`px-2 py-1 rounded-full text-xs ${
          task.category === 'WORK' 
            ? 'bg-indigo-100 text-indigo-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {task.category}
        </span>
        {task.dueDate && (
          <span className="text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;