import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { taskService, Task } from '../../services/taskService';
import { 
  FaBold, 
  FaItalic, 
  FaListUl, 
  FaListOl, 
  FaTimes, 
  FaUpload, 
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { BiHistory } from 'react-icons/bi';
import { HiOutlineDocumentText } from 'react-icons/hi';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  task?: Task | null;
}

type TaskCategory = 'WORK' | 'PERSONAL';
type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';

interface FormData {
  title: string;
  description: string;
  dueDate: string;
  category: TaskCategory;
  status: TaskStatus;
  attachment?: string;
}

interface Activity {
  action: string;
  timestamp: string;
  details?: string ;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated, task }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    dueDate: '',
    category: 'WORK',
    status: 'TO-DO',
    attachment: ''
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        attachment: task.attachment || ''
      });
      setImagePreview(task.attachment || null);
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        category: 'WORK',
        status: 'TO-DO',
        attachment: ''
      });
      setImagePreview(null);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Animation for modal entrance
      if (modalRef.current) {
        modalRef.current.classList.add('animate-in');
      }
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "testalas");
      data.append("cloud_name", "duw6f8fm8");

      const response = await fetch('https://api.cloudinary.com/v1_1/duw6f8fm8/image/upload', {
        method: "post",
        body: data
      });
      const responseData = await response.json();
      
      setFormData(prev => ({ ...prev, attachment: responseData.url }));
      setImagePreview(responseData.url);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (task?.id) {
        await taskService.updateTask(task.id, {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          category: formData.category,
          status: formData.status,
          attachment: formData.attachment,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newTask: Omit<Task, 'id'> = {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          category: formData.category,
          status: formData.status,
          attachment: formData.attachment,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activities: []
        };
        await taskService.createTask(newTask);
      }
      
      onTaskCreated();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      category: 'WORK',
      status: 'TO-DO',
      attachment: ''
    });
    setImagePreview(null);
  };

  if (!isOpen) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatText = (format: 'bold' | 'italic' | 'bullet' | 'number') => {
    if (!descriptionRef.current) return;
    
    const textarea = descriptionRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let cursorAdjustment = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorAdjustment = 4;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorAdjustment = 2;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        cursorAdjustment = 3;
        break;
      case 'number':
        formattedText = `\n1. ${selectedText}`;
        cursorAdjustment = 4;
        break;
    }
    
    const newValue = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, description: newValue }));
    
    // Set focus back to textarea and position cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorAdjustment, start + selectedText.length + cursorAdjustment);
    }, 0);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TO-DO': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'IN-PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TO-DO': return 'To Do';
      case 'IN-PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <HiOutlineDocumentText className="text-green-500" />;
      case 'UPDATED':
        return <FaClock className="text-blue-500" />;
      case 'STATUS_CHANGED':
        return <BiHistory className="text-amber-500" />;
      default:
        return <BiHistory className="text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-green-100 text-green-800';
      case 'UPDATED':
        return 'bg-blue-100 text-blue-800';
      case 'STATUS_CHANGED':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 p-3 sm:p-5">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl transform transition-all duration-300 scale-95 hover:scale-100 hover:opacity-100 flex flex-col lg:flex-row max-h-[90vh] overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-2 sm:mr-3">
                {task ? '✏️' : '✨'}
              </span>
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full lg:hidden"
              aria-label="Close"
            >
              <IoClose size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="flex items-center p-2 border-b bg-gray-50 overflow-x-auto">
                    <button 
                      type="button"
                      onClick={() => formatText('bold')}
                      className="p-1.5 hover:bg-gray-200 rounded-md mr-1 transition-colors"
                      aria-label="Bold"
                    >
                      <FaBold className="text-gray-600" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => formatText('italic')}
                      className="p-1.5 hover:bg-gray-200 rounded-md mr-1 transition-colors"
                      aria-label="Italic"
                    >
                      <FaItalic className="text-gray-600" />
                    </button>
                    <div className="mx-2 h-4 border-l border-gray-300"></div>
                    <button 
                      type="button"
                      onClick={() => formatText('bullet')}
                      className="p-1.5 hover:bg-gray-200 rounded-md mr-1 transition-colors"
                      aria-label="Bullet list"
                    >
                      <FaListUl className="text-gray-600" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => formatText('number')}
                      className="p-1.5 hover:bg-gray-200 rounded-md mr-1 transition-colors"
                      aria-label="Numbered list"
                    >
                      <FaListOl className="text-gray-600" />
                    </button>
                  </div>
                  <textarea
                    ref={descriptionRef}
                    name="description"
                    placeholder="Add details about your task..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] border-none focus:outline-none focus:ring-0 resize-none bg-white text-gray-700"
                    maxLength={300}
                  ></textarea>
                  <div className="flex justify-between items-center text-xs text-gray-500 px-3 sm:px-4 py-2 bg-gray-50">
                    <span>Markdown formatting supported</span>
                    <span>{formData.description.length}/300 characters</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm flex-1 transition-all ${
                        formData.category === 'WORK' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-300 font-medium shadow-sm' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, category: 'WORK' }))}
                    >
                      Work
                    </button>
                    <button
                      type="button"
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm flex-1 transition-all ${
                        formData.category === 'PERSONAL' 
                          ? 'bg-pink-100 text-pink-800 border border-pink-300 font-medium shadow-sm' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, category: 'PERSONAL' }))}
                    >
                      Personal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dueDate"
                      required
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border shadow-sm transition-all outline-none appearance-none bg-no-repeat bg-right ${getStatusColor(formData.status)}`}
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem"
                    }}
                  >
                    <option value="TO-DO">To Do</option>
                    <option value="IN-PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachment</label>
                <div className="border border-gray-300 border-dashed rounded-lg overflow-hidden shadow-sm">
                  {imagePreview ? (
                    <div className="relative group">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 sm:h-40 object-cover" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, attachment: '' }));
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="bg-white text-red-600 rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105"
                          aria-label="Remove image"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="py-4 sm:py-6 px-3 sm:px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-full text-purple-500 mb-2">
                        <FaUpload className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <p className="mt-1 text-sm text-gray-900">
                        <span className="text-purple-600 font-medium hover:text-purple-500">Click to upload</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      <input
                        ref={fileInputRef}
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={loading}
                      />
                    </div>
                  )}
                  {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-t-2 border-purple-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 sm:mt-8 sticky bottom-0 pt-3 pb-2 bg-white border-t mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>

        {task && task.activities && task.activities.length > 0 && (
          <div className="w-full lg:w-80 xl:w-80 border-t lg:border-t-0 lg:border-l lg:max-h-[90vh] bg-gray-50 overflow-y-auto">
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b sticky top-0 bg-gray-50 z-10">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">Activity</h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full hidden lg:block"
                aria-label="Close"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              {task.activities.map((activity: Activity, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1 p-2 rounded-full bg-gray-100">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getActivityBadgeColor(activity.action)}`}>
                        {activity.action}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">{activity.details}</p>
                  </div>
                </div>
              ))}

              {task.createdAt && (
                <div className="flex items-start space-x-3 opacity-70">
                  <div className="mt-1 p-2 rounded-full bg-gray-100">
                    <HiOutlineDocumentText className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        CREATED
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">Task created</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTaskModal;