"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  isLoading: boolean;
  text?: string;
}

const TaskLoader: React.FC<LoaderProps> = ({
  isLoading,
  text = "Processing your task..."
}) => {
  const primaryColor = "#8B5CF6"; // Purple
  const secondaryColor = "#EC4899"; // Pink for better contrast
  const accentColor = "#6EE7B7"; // Mint accent

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-xs w-full mx-4 flex flex-col items-center"
            style={{
              boxShadow: `0 10px 25px -5px rgba(139, 92, 246, 0.3)`
            }}
          >
            {/* Compact loader animation */}
            <div className="relative h-16 w-16 mb-4">
              {/* Orbiting particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-full"
                  initial={{ rotate: i * 60 }}
                  animate={{ rotate: i * 60 + 360 }}
                  transition={{ 
                    duration: 3 + i * 0.5, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: i * 0.1
                  }}
                >
                  <motion.div
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ 
                      backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                      top: 0,
                      left: "50%",
                      marginLeft: "-2px",
                    }}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                </motion.div>
              ))}
              
              <motion.div
                className="absolute top-1 left-1 right-1 bottom-1 rounded-full"
                style={{ 
                  background: `conic-gradient(from 0deg, ${primaryColor}, ${secondaryColor}, ${accentColor}, ${primaryColor})`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div 
                className="absolute inset-0 m-auto w-10 h-10 bg-white dark:bg-gray-800 rounded-full" 
                style={{ boxShadow: "inset 0 0 8px rgba(0,0,0,0.1)" }}
              />
              
              <motion.div
                className="absolute inset-0 m-auto w-4 h-4 rounded-full"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            
            <div className="relative overflow-hidden mb-3">
              <motion.p
                className="text-center text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {text}
              </motion.p>
              <motion.div 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)`,
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                style={{ 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${accentColor})` 
                }}
                className="h-full rounded-full"
                animate={{
                  width: ["0%", "100%"],
                  x: [0, 0]
                }}
                transition={{ 
                  width: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskLoader;