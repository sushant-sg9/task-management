import React from "react";
import { motion } from "framer-motion";

interface SkeletonTaskProps {
  delay?: number;
}

const SkeletonTask: React.FC<SkeletonTaskProps> = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-16 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse"></div>
      </div>
    </motion.div>
  );
};

interface SkeletonColumnProps {
  title: string;
  color: {
    bg: string;
    border: string;
    header: string;
    text: string;
    icon: string;
    textBg: string;
  };
  taskCount: number;
}

const SkeletonColumn: React.FC<SkeletonColumnProps> = ({ title, color, taskCount }) => {
  return (
    <div className={`rounded-xl border-2 ${color.border} ${color.bg} overflow-hidden flex flex-col h-full`}>
      <div className={`${color.header} p-4 flex justify-between items-center border-b ${color.border}`}>
        <h3 className={`text-base font-semibold rounded-lg py-1 px-3 ${color.textBg}`}>
          {title} <span className="text-sm">({taskCount})</span>
        </h3>
        <div className="p-2 rounded-full"></div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
        {Array.from({ length: taskCount }).map((_, index) => (
          <SkeletonTask key={index} delay={index * 0.05} />
        ))}
      </div>
    </div>
  );
};

const BoardSkeleton: React.FC = () => {
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonColumn title="TO-DO" color={columnColors["TO-DO"]} taskCount={3} />
        <SkeletonColumn title="IN-PROGRESS" color={columnColors["IN-PROGRESS"]} taskCount={2} />
        <SkeletonColumn title="COMPLETED" color={columnColors["COMPLETED"]} taskCount={4} />
      </div>
    </div>
  );
};

export default BoardSkeleton;