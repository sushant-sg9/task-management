"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { taskService, type Task } from "../../services/taskService";
import {
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaPlus,
  FaEllipsisH,
  FaCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { TbGridDots } from "react-icons/tb";
import { PiCheckCircleFill } from "react-icons/pi";
import Loader from "../Utiles/Loader";
import { motion, AnimatePresence } from "framer-motion";

interface ListViewProps {
  onEditTask: (task: Task) => void;
  searchQuery: string;
  filters?: { category: string; dueDate: string };
}

const ListView: React.FC<ListViewProps> = ({
  onEditTask,
  searchQuery,
  filters = { category: "", dueDate: "" },
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState({
    category: "",
    dueDate: "",
    searchTerm: "",
  });
  const [expandedSections, setExpandedSections] = useState({
    "TO-DO": true,
    "IN-PROGRESS": true,
    COMPLETED: true,
  });
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "updatedAt">>({
    title: "",
    description: "",
    status: "TO-DO",
    category: "WORK",
    dueDate: new Date().toISOString().split("T")[0],
    userId: "",
    createdAt: new Date().toISOString(),
    activities: [],
    attachment: undefined,
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [activeTaskAction, setActiveTaskAction] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [multiSelectStatusOpen, setMultiSelectStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const multiSelectDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
  }>({});

  const [statusDropdownTaskId, setStatusDropdownTaskId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (user) {
      loadTasks();
      setNewTask((prev) => ({
        ...prev,
        userId: user.uid || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    setFilter({
      ...filter,
      category: filters?.category || "",
      dueDate: filters?.dueDate || "",
      searchTerm: searchQuery || "",
    });
  }, [searchQuery, filters]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const userTasks = await taskService.getUserTasks(user?.uid || "");
      setTasks(userTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
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

  const handleDeleteSelectedTasks = async () => {
    setLoading(true);
    try {
      const deletePromises = selectedTasks.map((taskId) =>
        taskService.deleteTask(taskId)
      );

      await Promise.all(deletePromises);
      setTasks(tasks.filter((task) => !selectedTasks.includes(task.id!)));
      setSelectedTasks([]);
    } catch (error) {
      console.error("Error deleting multiple tasks:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleStatusDropdown = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setStatusDropdownTaskId(statusDropdownTaskId === taskId ? null : taskId);
    setActiveDropdown(null);
    setActiveTaskAction(null);
  };
  const handleAddTask = async () => {
    const newErrors: {
      title?: string;
    } = {};

    if (!newTask.title || newTask.title.trim() === "") {
      newErrors.title = "Title is required";
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const taskToCreate = {
        ...newTask,
        userId: user?.uid || "",
        updatedAt: new Date().toISOString(),
      };

      if (taskToCreate.attachment === undefined) {
        delete taskToCreate.attachment;
      }

      await taskService.createTask(taskToCreate);
      await loadTasks();
      setAddingTask(false);
      setNewTask({
        title: "",
        description: "",
        status: "TO-DO",
        category: "WORK",
        dueDate: new Date().toISOString().split("T")[0],
        userId: user?.uid || "",
        createdAt: new Date().toISOString(),
        activities: [],
        attachment: undefined,
      });
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        multiSelectDropdownRef.current &&
        !multiSelectDropdownRef.current.contains(target)
      ) {
        setActiveDropdown(null);
        setActiveTaskAction(null);
        setMultiSelectStatusOpen(false);
        setStatusDropdownTaskId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (task: Task, newStatus: Task["status"]) => {
    setLoading(true);
    try {
      await taskService.updateTask(task.id!, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: Task["status"]) => {
    setLoading(true);
    try {
      const updatePromises = selectedTasks.map((taskId) =>
        taskService.updateTask(taskId, { status: newStatus })
      );

      await Promise.all(updatePromises);
      await loadTasks();
      setMultiSelectStatusOpen(false);
    } catch (error) {
      console.error("Error updating multiple task statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (
      section === "TO-DO" ||
      section === "IN-PROGRESS" ||
      section === "COMPLETED"
    ) {
      setExpandedSections({
        ...expandedSections,
        [section]: !expandedSections[section],
      });
    }
  };

  const toggleTaskAction = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveTaskAction(activeTaskAction === taskId ? null : taskId);
    setActiveDropdown(null);
  };

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    }
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })}, ${date.getFullYear()}`;
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

  const todoTasks = filterTasks(
    tasks.filter((task) => task.status === "TO-DO")
  );
  const inProgressTasks = filterTasks(
    tasks.filter((task) => task.status === "IN-PROGRESS")
  );
  const completedTasks = filterTasks(
    tasks.filter((task) => task.status === "COMPLETED")
  );

  const getSectionColor = (status: string) => {
    switch (status) {
      case "TO-DO":
        return "bg-purple-100";
      case "IN-PROGRESS":
        return "bg-blue-100";
      case "COMPLETED":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const getSectionHeaderColor = (status: string) => {
    switch (status) {
      case "TO-DO":
        return "bg-purple-200";
      case "IN-PROGRESS":
        return "bg-blue-200";
      case "COMPLETED":
        return "bg-green-200";
      default:
        return "bg-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "TO-DO":
        return "text-gray-700";
      case "IN-PROGRESS":
        return " text-blue-700";
      case "COMPLETED":
        return " text-green-700";
      default:
        return "text-gray-700";
    }
  };

  const getStatusCircleColor = (status: string) => {
    switch (status) {
      case "TO-DO":
        return "text-gray-400";
      case "IN-PROGRESS":
        return "text-blue-500";
      case "COMPLETED":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "WORK":
        return "text-indigo-700";
      case "PERSONAL":
        return "text-orange-700";
      default:
        return "text-gray-700";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 },
    },
  };

  const accordionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const statusBadgeVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const checkboxVariants = {
    unchecked: { scale: 1 },
    checked: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
  };

  const addButtonVariants = {
    hover: { scale: 1.05, backgroundColor: "#8B5CF6" },
    tap: { scale: 0.95 },
  };

  const renderTaskSection = (status: Task["status"], tasksArray: Task[]) => {
    const sectionTitle =
      status === "TO-DO"
        ? "Todo"
        : status === "IN-PROGRESS"
        ? "In-Progress"
        : "Completed";

    return (
      <motion.div
        className="mb-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1">
          <motion.div
            className={` rounded-t-xl flex items-center justify-between p-5 ${getSectionHeaderColor(
              status
            )} cursor-pointer transition-all duration-200 ease-in-out`}
            onClick={(e) => toggleSection(status, e)}
            whileHover={{
              backgroundColor:
                status === "TO-DO"
                  ? "#C4B5FD"
                  : status === "IN-PROGRESS"
                  ? "#93C5FD"
                  : "#86EFAC",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="font-semibold flex items-center space-x-2 text-gray-800">
              <span>
                {sectionTitle} ({tasksArray.length})
              </span>
            </h2>
            <motion.div
              animate={{ rotate: expandedSections[status] ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown size={16} className="text-gray-700" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {expandedSections[status] && (
              <motion.div
                className={`${getSectionColor(
                  status
                )} transition-all duration-200 ease-in-out`}
                variants={accordionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {status === "TO-DO" && (
                  <div className="p-4 bg-[#f1f1f1] border-b border-gray-300">
                    {!addingTask ? (
                      <motion.button
                        className="flex items-center text-purple-700 hover:text-purple-900 transition-colors duration-200 font-bold text-sm py-3 px-6 rounded-full hover:bg-purple-100 shadow-md border-2 border-purple-300"
                        onClick={() => {
                          setAddingTask(true);
                          setErrors({});
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlus size={14} className="mr-2" /> ADD TASK
                      </motion.button>
                    ) : (
                      <motion.div
                        className="bg-gray-50 rounded-xl shadow-lg p-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-1 gap-5">
                          <div>
                            <motion.input
                              type="text"
                              placeholder="Task Title"
                              className="w-full p-4 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-500 focus:border-purple-500 text-gray-800 placeholder-gray-500 shadow-md transition-all duration-200 bg-white hover:border-purple-400"
                              value={newTask.title}
                              onChange={(e) => {
                                setNewTask({
                                  ...newTask,
                                  title: e.target.value,
                                });
                                if (errors.title) {
                                  setErrors({ ...errors, title: undefined });
                                }
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            />
                            {errors.title && (
                              <motion.p
                                className="text-red-600 text-xs mt-1 ml-1 font-medium"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {errors.title}
                              </motion.p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div
                              className="relative"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <FaCalendarAlt className="text-purple-500 text-lg" />
                              </div>
                              <input
                                type="date"
                                className="w-full pl-12 p-4 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-500 focus:border-purple-500 shadow-md bg-white hover:border-purple-400 transition-all duration-200 text-gray-800"
                                value={newTask.dueDate}
                                onChange={(e) =>
                                  setNewTask({
                                    ...newTask,
                                    dueDate: e.target.value,
                                  })
                                }
                              />
                            </motion.div>

                            <motion.div
                              className="relative"
                              id="status-dropdown-container"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <button
                                className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-xl hover:border-purple-400 transition-colors duration-200 shadow-md text-gray-800 focus:outline-none focus:ring-3 focus:ring-purple-500 focus:border-purple-500"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setStatusDropdownOpen(!statusDropdownOpen);
                                  setCategoryDropdownOpen(false);
                                }}
                              >
                                <span className="text-gray-800 font-medium">
                                  {newTask.status}
                                </span>
                                <FaChevronDown
                                  size={14}
                                  className="text-gray-600"
                                />
                              </button>
                              <AnimatePresence>
                                {statusDropdownOpen && (
                                  <motion.div
                                    className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl"
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                  >
                                    <div className="py-1">
                                      {(
                                        [
                                          "TO-DO",
                                          "IN-PROGRESS",
                                          "COMPLETED",
                                        ] as const
                                      ).map((statusOption) => (
                                        <motion.div
                                          key={statusOption}
                                          className="px-5 py-3 hover:bg-purple-100 cursor-pointer text-sm font-medium transition-colors duration-200"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewTask({
                                              ...newTask,
                                              status: statusOption,
                                            });
                                            setStatusDropdownOpen(false);
                                          }}
                                          whileHover={{
                                            backgroundColor: "#EDE9FE",
                                          }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          {statusOption}
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>

                            <motion.div
                              className="relative"
                              id="category-dropdown-container"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                            >
                              <button
                                className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-xl hover:border-purple-400 transition-colors duration-200 shadow-md text-gray-800 focus:outline-none focus:ring-3 focus:ring-purple-500 focus:border-purple-500"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCategoryDropdownOpen(
                                    !categoryDropdownOpen
                                  );
                                  setStatusDropdownOpen(false);
                                }}
                              >
                                <span className="text-gray-800 font-medium">
                                  {newTask.category}
                                </span>
                                <FaChevronDown
                                  size={14}
                                  className="text-gray-600"
                                />
                              </button>
                              <AnimatePresence>
                                {categoryDropdownOpen && (
                                  <motion.div
                                    className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl"
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                  >
                                    <div className="py-1">
                                      {(["WORK", "PERSONAL"] as const).map(
                                        (categoryOption) => (
                                          <motion.div
                                            key={categoryOption}
                                            className="px-5 py-3 hover:bg-purple-100 cursor-pointer text-sm font-medium transition-colors duration-200"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setNewTask({
                                                ...newTask,
                                                category: categoryOption,
                                              });
                                              setCategoryDropdownOpen(false);
                                            }}
                                            whileHover={{
                                              backgroundColor: "#EDE9FE",
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                          >
                                            {categoryOption}
                                          </motion.div>
                                        )
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>

                          <div className="flex space-x-4 mt-2">
                            <motion.button
                              className="px-4 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200 font-bold text-sm flex items-center shadow-lg"
                              onClick={handleAddTask}
                              variants={addButtonVariants}
                              whileHover="hover"
                              whileTap="tap"
                            >
                              ADD
                            </motion.button>
                            <motion.button
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-bold text-sm shadow-md"
                              onClick={() => setAddingTask(false)}
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: "#E5E7EB",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              CANCEL
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                <motion.div
                  className="grid grid-cols-1 bg-white "
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {tasksArray.length > 0 ? (
                    tasksArray.map((task) => (
                      <motion.div
                        key={task.id}
                        className={`grid grid-cols-1  border-b border-gray-300 md:grid-cols-4 last:border-b-0 bg-gray-100 hover:bg-gray-100 transition-all duration-200 px-4 py-3 ${
                          selectedTasks.includes(task.id!)
                            ? "bg-purple-100"
                            : ""
                        }`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <motion.div
                              className={`flex items-center justify-center w-6 h-6 rounded-md border-2 ${
                                selectedTasks.includes(task.id!)
                                  ? "bg-purple-700 border-purple-800"
                                  : "border-gray-400"
                              } mr-3 cursor-pointer shadow-md`}
                              onClick={() => toggleTaskSelection(task.id!)}
                              variants={checkboxVariants}
                              animate={
                                selectedTasks.includes(task.id!)
                                  ? "checked"
                                  : "unchecked"
                              }
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {selectedTasks.includes(task.id!) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 15,
                                  }}
                                >
                                  <PiCheckCircleFill
                                    size={18}
                                    className="text-white"
                                  />
                                </motion.div>
                              )}
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <PiCheckCircleFill
                                size={18}
                                className={`mr-3 ${getStatusCircleColor(
                                  task.status
                                )}`}
                              />
                            </motion.div>
                            <TbGridDots className="mr-3 text-gray-500 hidden md:block" />
                            <span
                              className={`${
                                task.status === "COMPLETED"
                                  ? "line-through text-gray-500"
                                  : "text-gray-800 font-medium"
                              } truncate w-40 block`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {/* Action menu button for mobile */}
                          <div className="md:hidden relative" ref={dropdownRef}>
                            <motion.button
                              onClick={(e) => toggleTaskAction(task.id!, e)}
                              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors duration-200"
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEllipsisH size={16} />
                            </motion.button>

                            <AnimatePresence>
                              {activeTaskAction === task.id && (
                                <motion.div
                                  className="absolute z-10 right-0 top-10 bg-white rounded-xl shadow-xl w-40"
                                  variants={dropdownVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  <div className="py-1">
                                    <motion.div
                                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer font-medium"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTask(task);
                                        setActiveTaskAction(null);
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <FaEdit className="mr-3 text-blue-600" />{" "}
                                      Edit
                                    </motion.div>
                                    <motion.div
                                      className="flex items-center px-4 py-3 text-sm text-red-700 hover:bg-gray-100 cursor-pointer font-medium"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id!);
                                        setActiveTaskAction(null);
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <FaTrash className="mr-3" /> Delete
                                    </motion.div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="hidden md:block text-sm text-gray-700 font-medium">
                          {formatDate(task.dueDate)}
                        </div>

                        <div className="hidden md:block">
                          <div className="relative">
                            <motion.span
                              className={`px-4 py-2 text-xs rounded-lg ${getStatusBadgeColor(
                                task.status
                              )} font-bold cursor-pointer flex items-center justify-start`}
                              onClick={(e) => toggleStatusDropdown(task.id!, e)}
                              variants={statusBadgeVariants}
                            
                              whileTap="tap"
                            >
                              <span className="bg-gray-200 rounded-sm px-4 py-2">{task.status}</span>
                              
                            </motion.span>

                            <AnimatePresence>
                              {statusDropdownTaskId === task.id && (
                                <motion.div
                                  className="absolute z-20 left-0 mt-2 bg-white rounded-xl shadow-xl w-40"
                                  variants={dropdownVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  <div className="py-1">
                                    {(
                                      [
                                        "TO-DO",
                                        "IN-PROGRESS",
                                        "COMPLETED",
                                      ] as const
                                    ).map((statusOption) => (
                                      <motion.div
                                        key={statusOption}
                                        className={`px-4 py-3 hover:bg-gray-200 cursor-pointer text-sm transition-colors duration-200 ${
                                          task.status === statusOption
                                            ? "bg-gray-50 font-bold"
                                            : "font-medium"
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(
                                            task,
                                            statusOption
                                          );
                                          setStatusDropdownTaskId(null);
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <div className="flex items-center">
                                          <FaCircle
                                            size={10}
                                            className={`mr-3 ${getStatusCircleColor(
                                              statusOption
                                            )}`}
                                          />
                                          {statusOption}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-between">
                          <span
                            className={`text-sm font-bold ${getCategoryStyle(
                              task.category
                            )}`}
                          >
                            {task.category}
                          </span>

                          <div className="relative" ref={dropdownRef}>
                            <motion.button
                              onClick={(e) => toggleTaskAction(task.id!, e)}
                              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors duration-200"
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaEllipsisH size={16} />
                            </motion.button>

                            <AnimatePresence>
                              {activeTaskAction === task.id && (
                                <motion.div
                                  className="absolute z-10 right-0 top-10 bg-white rounded-xl shadow-xl w-40"
                                  variants={dropdownVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  <div className="py-1">
                                    <motion.div
                                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer font-medium"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTask(task);
                                        setActiveTaskAction(null);
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <FaEdit className="mr-3 text-blue-600" />{" "}
                                      Edit
                                    </motion.div>
                                    <motion.div
                                      className="flex items-center px-4 py-3 text-sm text-red-700 hover:bg-gray-100 cursor-pointer font-medium"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id!);
                                        setActiveTaskAction(null);
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <FaTrash className="mr-3" /> Delete
                                    </motion.div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-600 bg-gray-100 font-medium rounded-lg rounded-b-xl">
                      {status === "TO-DO"
                        ? "No Tasks in Todo"
                        : status === "IN-PROGRESS"
                        ? "No Tasks in Progress"
                        : "No Completed Tasks"}
                    </div>
                  )}
                </motion.div>

                {tasksArray.length > 5 && (
                  <div className="p-4 text-center bg-gray-50">
                    <button className="text-purple-700 hover:text-purple-900 text-sm font-bold transition-all duration-200 py-2 px-6 rounded-full hover:bg-purple-100 border-2 border-purple-300 shadow-md">
                      Load more
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {loading && <Loader isLoading={loading} />}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="hidden md:grid grid-cols-12 gap-4 px-3 py-2 bg-gray-50 rounded-t-lg">
          <div className="col-span-3 text-sm font-semibold uppercase text-gray-500">
            Task name
          </div>
          <div className="col-span-3 text-sm font-semibold uppercase text-gray-500">
            Due date
          </div>
          <div className="col-span-3 text-sm font-semibold uppercase text-gray-500">
            Status
          </div>
          <div className="col-span-2 text-sm font-semibold uppercase text-gray-500">
            Category
          </div>
        </div>
        <div className="space-y-4">
          {renderTaskSection("TO-DO", todoTasks)}
          {renderTaskSection("IN-PROGRESS", inProgressTasks)}
          {renderTaskSection("COMPLETED", completedTasks)}
        </div>

        {selectedTasks.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center p-6">
    <motion.div
      className="bg-black text-white rounded-xl shadow-lg p-3 flex items-center justify-between max-w-md w-full mx-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
    >
      <div className="flex items-center">
        <span className="font-medium mr-2 text-sm">
          {selectedTasks.length} Tasks Selected
        </span>
        <motion.button
          onClick={() => setSelectedTasks([])}
          className="text-gray-400 hover:text-white rounded-full h-6 w-6 flex items-center justify-center"
          whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative" ref={multiSelectDropdownRef}>
          <motion.button
            onClick={() =>
              setMultiSelectStatusOpen(!multiSelectStatusOpen)
            }
            className="px-3 py-1.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors duration-150 text-xs font-medium"
            whileHover={{ scale: 1.05, backgroundColor: "#374151" }}
            whileTap={{ scale: 0.95 }}
          >
            Status
          </motion.button>
          <AnimatePresence>
            {multiSelectStatusOpen && (
              <motion.div
                className="absolute z-10 right-0 bottom-10 bg-white border border-gray-200 rounded-xl shadow-lg w-32 overflow-hidden"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="py-1">
                  {(["TO-DO", "IN-PROGRESS", "COMPLETED"] as const).map(
                    (statusOption) => (
                      <motion.div
                        key={statusOption}
                        className="px-3 py-2 hover:bg-gray-50 text-gray-800 cursor-pointer text-xs transition-colors duration-150"
                        onClick={() =>
                          handleBulkStatusChange(statusOption)
                        }
                        whileHover={{ 
                          backgroundColor: "#F3F4F6", 
                          x: 3,
                          fontWeight: "bold" 
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {statusOption}
                      </motion.div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={handleDeleteSelectedTasks}
          className="px-3 py-1.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-150 text-xs font-medium"
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: "#DC2626",
            boxShadow: "0 0 8px rgba(220,38,38,0.5)" 
          }}
          whileTap={{ scale: 0.95 }}
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  </div>
)}
      </div>
    </>
  );
};

export default ListView;
