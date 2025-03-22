# TaskMaster

A modern task management application with intuitive drag-and-drop functionality, multiple views, and comprehensive task organization features.
Demo
Check out the live demo: https://task-management-alpha-liart.vercel.app/
## Features

- **User Authentication**: Secure login with Firebase Authentication and Google Sign-In
- **Profile Management**: Users can view and update their profile information
- **Comprehensive Task Management**:
  - Create, edit, and delete tasks
  - Categorize tasks (work, personal, etc.)
  - Add tags to tasks for better organization
  - Set and manage due dates
- **Flexible Views**:
  - Kanban-style board view with drag-and-drop functionality
  - List view for traditional task management
  - Toggle between views based on preference
- **Advanced Task Organization**:
  - Drag-and-drop to reorder and organize tasks
  - Sort tasks by due date (ascending/descending)
  - Perform batch actions (delete multiple tasks, mark multiple as complete)

## Getting Started

### Prerequisites

- Node.js (v16.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/sushant-sg9/task-management
   cd task-management
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```


3. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Technical Implementation

The project is built with:

- **React** with **TypeScript** for type safety
- **Vite** as the build tool for fast development and optimized production builds
- **Firebase** for authentication and data storage
- **Tailwind CSS** for styling
- **dnd-kit** for drag-and-drop functionality
- **React Router** for navigation
- **Framer Motion** for animations

## Challenges and Solutions

### Drag and Drop Implementation

**Challenges:**

1. **State Synchronization**: Maintaining real-time synchronization between the UI state and Firebase database during drag operations was challenging.

2. **Performance Issues**: Initially experienced lag when dragging items, especially with many tasks.

3. **Cross-Column Movement**: Implementing drag and drop between different columns (e.g., from "To Do" to "In Progress") required complex state management.

4. **Mobile Responsiveness**: Making the drag and drop functionality work well on touch devices required additional consideration.

**Solutions:**

1. **Optimistic Updates**: Implemented optimistic UI updates before confirming changes with Firebase, providing immediate feedback while maintaining data integrity.

2. **Virtualization**: Used efficient rendering techniques to only render visible tasks, improving performance with large task lists.

3. **Custom dnd-kit Hooks**: Created custom hooks to manage the complex state transitions required for cross-column movements with proper validation.

4. **Touch Sensitivity Tuning**: Adjusted touch sensitivity parameters in dnd-kit to provide a better experience on mobile devices, with special attention to differentiating between scrolling and dragging gestures.

### Firebase Integration

**Challenges:**

1. **Real-time Updates**: Ensuring all users see the most current task state without excessive re-renders.

2. **Authentication Flow**: Creating a seamless authentication experience while protecting routes.

**Solutions:**


1. **Custom Auth Hooks**: Built custom authentication hooks to simplify the auth flow and route protection.
