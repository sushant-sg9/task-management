import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { taskService, Task } from "../../services/taskService";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { FiMoreHorizontal, FiCalendar, FiPaperclip } from "react-icons/fi";
import { format } from "date-fns";
import Loader from "../Utiles/Loader";
import BoardSkeleton from "../Utiles/BoardSkeleton";

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
    isDragging,
  } = useSortable({
    id: task.id!,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd");
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
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border ${
        isDragging
          ? "shadow-lg ring-2 ring-blue-500 border-blue-200"
          : "border-gray-200"
      } cursor-pointer`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`${
            task.status === "COMPLETED"
              ? "line-through text-gray-400"
              : "text-gray-800 font-medium mb-2.5 truncate line-clamp-2 text-base"
          } truncate w-40 block text-xl mb-4`}
        >
          {task.title}
        </h3>
        <div className="relative group">
          <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiMoreHorizontal size={16} />
          </button>
          <div className="absolute right-0 top-5 mt-1 w-40 bg-white shadow-xl rounded-lg hidden group-hover:block z-10 border border-gray-100">
            <div className="py-1">
              <button
                onClick={onEdit}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{task.category}</span>
          <span className="text-xs text-gray-500">
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

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
    textBg: string;
  };
}> = ({ id, tasks, onEdit, onDelete, onAddTask, color }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={`rounded-xl border-2 ${color.border} ${
        color.bg
      } overflow-hidden flex flex-col h-full transition-all duration-300 ${
        isOver ? "ring-2 ring-blue-500 shadow-lg translate-y-[-2px]" : ""
      }`}
    >
      <div
        className={`${color.header} p-4 flex justify-between items-center border-b ${color.border}`}
      >
        <h3
          className={`text-base font-semibold rounded-lg py-1 px-3 ${color.textBg}`}
        >
          {id} <span className="text-sm">({tasks.length})</span>
        </h3>
        <button
          onClick={onAddTask}
          className={`p-2 rounded-full hover:bg-white/50 transition-colors ${color.icon}`}
        ></button>
      </div>
      <div
        ref={setNodeRef}
        className="p-4 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]"
      >
        <SortableContext
          items={tasks.map((task) => task.id!)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div key={task.id} className="mb-4" layout>
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
            <p className="text-sm mt-1 text-gray-400">or add new task</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface BoardViewProps {
  onEditTask: (task: Task) => void;
  onAddTask?: (status: string) => void;
  searchQuery: string;
  filters?: { category: string; dueDate: string };
}
const COLUMNS = ["TO-DO", "IN-PROGRESS", "COMPLETED"] as const;

const BoardView: React.FC<BoardViewProps> = ({
  onEditTask,
  onAddTask,
  searchQuery,
  filters = { category: "", dueDate: "" },
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    category: "",
    dueDate: "",
    searchTerm: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  useEffect(() => {
    setFilter({
      category: filters?.category || "",
      dueDate: filters?.dueDate || "",
      searchTerm: searchQuery || "",
    });
  }, [searchQuery, filters]);

const loadTasks = async () => {
  setLoading(true);
  setInitialLoading(true);
  
  try {
    const userTasks = await taskService.getUserTasks(user?.uid || "");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTasks(userTasks);
  } catch (error) {
    console.error("Error loading tasks:", error);
  } finally {
    setLoading(false);
    setInitialLoading(false);
  }
};

  const handleDeleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const findContainerForTask = (taskId: string): string => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.status || "";
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
      const task = tasks.find((t) => t.id === activeId);
      if (task && task.status !== overId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId
              ? { ...t, status: overId as (typeof COLUMNS)[number] }
              : t
          )
        );

        try {
          await taskService.updateTask(activeId, {
            status: overId as (typeof COLUMNS)[number],
          });
        } catch (error) {
          console.error("Error updating task status:", error);
          loadTasks();
        }
      }
    } else if (activeId !== overId) {
      const activeContainer = findContainerForTask(activeId);
      const overContainer = findContainerForTask(overId);

      if (activeContainer !== overContainer) {
        const newTasks = [...tasks];
        const activeTaskIndex = newTasks.findIndex((t) => t.id === activeId);

        newTasks[activeTaskIndex] = {
          ...newTasks[activeTaskIndex],
          status: overContainer as (typeof COLUMNS)[number],
        };

        setTasks(newTasks);

        try {
          await taskService.updateTask(activeId, {
            status: overContainer as (typeof COLUMNS)[number],
          });
        } catch (error) {
          console.error("Error updating task status:", error);
          loadTasks();
        }
      } else {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        const newTasks = arrayMove(tasks, activeIndex, overIndex);
        setTasks(newTasks);
      }
    }

    setActiveTask(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filterTasks = (tasksArray: Task[]) => {
    return tasksArray.filter((task) => {
      const searchMatch =
        !filter.searchTerm ||
        task.title.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        task.description
          .toLowerCase()
          .includes(filter.searchTerm.toLowerCase());

      const categoryMatch =
        !filter.category ||
        task.category.toUpperCase() === filter.category.toUpperCase();

      let dueDateMatch = true;
      if (filter.dueDate) {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter.dueDate.toUpperCase()) {
          case "TODAY":
            dueDateMatch = isToday(taskDate);
            break;
          case "LAST DAY":
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            dueDateMatch =
              taskDate.getDate() === yesterday.getDate() &&
              taskDate.getMonth() === yesterday.getMonth() &&
              taskDate.getFullYear() === yesterday.getFullYear();
            break;
          case "LAST WEEK":
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            dueDateMatch = taskDate >= oneWeekAgo && taskDate <= today;
            break;
          case "LAST MONTH":
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            dueDateMatch = taskDate >= oneMonthAgo && taskDate <= today;
            break;
          default:
            dueDateMatch = true;
        }
      }

      return searchMatch && categoryMatch && dueDateMatch;
    });
  };

  const getColumnTasks = (status: (typeof COLUMNS)[number]) => {
    const statusTasks = tasks.filter((task) => task.status === status);
    return filterTasks(statusTasks);
  };

  const columnColors = {
    "TO-DO": {
      bg: "bg-gray-100",
      border: "border-0",
      header: "bg-gray-100",
      text: "text-gray-800",
      icon: "text-gray-700 hover:text-gray-900",
      textBg: "bg-purple-200",
    },
    "IN-PROGRESS": {
      bg: "bg-gray-100",
      border: "border-0",
      header: "bg-gray-100",
      text: "text-amber-800",
      icon: "text-amber-700 hover:text-amber-900",
      textBg: "bg-amber-200",
    },
    COMPLETED: {
      bg: "bg-gray-100",
      border: "border-0",
      header: "bg-gray-100",
      text: "text-emerald-800",
      icon: "text-emerald-700 hover:text-emerald-900",
      textBg: "bg-emerald-200",
    },
  };
  if (initialLoading) {
    return <BoardSkeleton />;
  }

  return (
    <>
      {loading && !initialLoading && <Loader isLoading={loading} />}
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
    </>
  );
};

export default BoardView;
