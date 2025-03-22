"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  isLoading: boolean;
}

const TaskLoader: React.FC<LoaderProps> = ({ isLoading }) => {
  // Task management app color palette (inspired by Trello/ClickUp)
  const primaryColor = "#5E6AD2"; // Blue/indigo (primary brand color)
  const secondaryColor = "#26C0E2"; // Cyan (secondary accent)
  const accentColor = "#9F7AEA"; // Purple (tertiary accent)

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-5 flex items-center justify-center"
            style={{
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08)`,
              width: "80px",
              height: "80px"
            }}
          >
            {/* Compact task card spinner */}
            <div className="relative h-14 w-14">
              {/* Main spinning card-like element */}
              <motion.div
                className="absolute inset-0 rounded-md"
                style={{ 
                  backgroundColor: primaryColor,
                  opacity: 0.7
                }}
                animate={{ 
                  rotate: 360,
                  scale: [1, 0.9, 1]
                }}
                transition={{ 
                  rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              
              {/* Secondary card offset slightly */}
              <motion.div
                className="absolute inset-0 rounded-md"
                style={{ 
                  backgroundColor: secondaryColor,
                  opacity: 0.7,
                  top: "3px",
                  left: "3px",
                  right: "-3px",
                  bottom: "-3px"
                }}
                animate={{ 
                  rotate: 360
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              
              {/* Tertiary card with different animation */}
              <motion.div
                className="absolute inset-0 rounded-md"
                style={{ 
                  backgroundColor: accentColor,
                  opacity: 0.7,
                  top: "-3px",
                  left: "-3px",
                  right: "3px",
                  bottom: "3px"
                }}
                animate={{ 
                  rotate: -360
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.1
                }}
              />
              
              {/* Task checkbox indicator in the center */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded bg-white dark:bg-gray-700 flex items-center justify-center"
                animate={{ 
                  scale: [0.8, 1, 0.8],
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <motion.div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              </motion.div>
              
              {/* Mini task line indicators */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  className="absolute h-1 rounded-full bg-white dark:bg-gray-700"
                  style={{ 
                    width: i === 0 ? "40%" : "30%",
                    left: "25%",
                    top: i === 0 ? "35%" : "55%",
                    opacity: 0.6
                  }}
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    width: i === 0 ? ["40%", "50%", "40%"] : ["30%", "40%", "30%"]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskLoader;