"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FiClipboard, FiSearch, FiChevronDown, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../Context/AuthContext";

type NavTabProps = {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

const NavTab = ({ active, icon, label, onClick }: NavTabProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? "border-purple-700 text-purple-700"
        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
    }`}
  >
    {icon}
    {label}
  </button>
);

const FilterDropdown = ({ label, options, value, onChange }: { 
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 appearance-none cursor-pointer"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

type NavbarProps = {
  onViewChange?: (view: "list" | "board") => void;
  currentView?: "list" | "board";
  onSearch?: (query: string) => void;
};

export default function Navbar({ onViewChange, currentView = "list", onSearch }: NavbarProps) {
  const [activeTab, setActiveTab] = useState<"list" | "board">(currentView);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const { user, signOut } = useAuth();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (currentView !== activeTab) {
      setActiveTab(currentView);
    }
  }, [currentView]);

  const handleTabChange = (tab: "list" | "board") => {
    setActiveTab(tab);
    if (onViewChange) {
      onViewChange(tab);
    }
  };

  const handleAddTask = () => {
    const event = new CustomEvent('openAddTaskModal');
    window.dispatchEvent(event);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <FiClipboard className="text-purple-700 text-xl" />
            <span className="text-xl font-bold text-purple-700">TaskBuddy</span>
          </div>

          <div className="block md:hidden">
            <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-gray-700">
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          <div className="hidden md:flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.photoURL || ""}
                alt={user?.displayName || "User"}
                className="w-10 h-10 rounded-full"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">
                  {user?.displayName?.split(" ")[0] || "User"}
                </span>
              </div>
            </div>
            <div>
              <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 hover:text-red-600 group">
                <FiLogOut className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-2 bg-white border-t border-b border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src={user?.photoURL || ""}
                alt={user?.displayName || "User"}
                className="w-10 h-10 rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm font-medium">
                {user?.displayName?.split(" ")[0] || "User"}
              </span>
            </div>
            <div className="flex justify-center">
              <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 hover:text-red-600 group">
                <FiLogOut className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4">
          <div>
            <div className="flex items-center">
              <NavTab
                active={activeTab === "list"}
                icon={<span className="text-xs">☰</span>}
                label="List"
                onClick={() => handleTabChange("list")}
              />
              <NavTab
                active={activeTab === "board"}
                icon={<span className="text-xs">⊞</span>}
                label="Board"
                onClick={() => handleTabChange("board")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 py-4">
              <span className="text-sm text-gray-500">Filter by:</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 py-2">
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-700"
              />
            </div>

            <button 
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-700 rounded-full hover:bg-purple-800 transition-colors"
              onClick={handleAddTask}
            >
              ADD TASK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}