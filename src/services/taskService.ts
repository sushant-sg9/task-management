import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, getDoc } from "firebase/firestore"
import { db } from "../Components/Lib/Firebase"

// Define the Activity type
export interface Activity {
  action: "CREATED" | "UPDATED" | "STATUS_CHANGED"
  timestamp: string
  details?: string
}

export interface Task {
  id?: string
  title: string
  description: string
  dueDate: string
  category: "WORK" | "PERSONAL"
  status: "TO-DO" | "IN-PROGRESS" | "COMPLETED"
  userId: string
  createdAt: string
  updatedAt: string
  activities: Activity[]
  attachment?: string
}

export const taskService = {
  async createTask(task: Omit<Task, "id">) {
    try {
     
      const taskWithActivities = {
        ...task,
        activities: [
          {
            action: "CREATED",
            timestamp: new Date().toISOString(),
            details: "Task created"
          }
        ]
      }
      
      const docRef = await addDoc(collection(db, "tasks"), taskWithActivities)
      return { id: docRef.id, ...taskWithActivities }
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      const taskRef = doc(db, "tasks", taskId)
      const taskSnap = await getDoc(taskRef)
      
      if (!taskSnap.exists()) {
        throw new Error("Task not found")
      }
      
      const currentTask = taskSnap.data() as Task
      const activities = currentTask.activities || []
      
      // Create a new activity based on what changed
      const newActivity: Activity = {
        action: "UPDATED",
        timestamp: new Date().toISOString(),
        details: this._getUpdateDetails(updates)
      }
      
      // Special handling for status changes
      if (updates.status && updates.status !== currentTask.status) {
        newActivity.action = "STATUS_CHANGED"
        newActivity.details = `Status changed from ${currentTask.status} to ${updates.status}`
      }
      
      await updateDoc(taskRef, { 
        ...updates, 
        updatedAt: new Date().toISOString(),
        activities: [...activities, newActivity]
      })
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  },

  async deleteTask(taskId: string) {
    try {
      const taskRef = doc(db, "tasks", taskId)
      await deleteDoc(taskRef)
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  },

  async getUserTasks(userId: string) {
    try {
      const q = query(collection(db, "tasks"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error("Error fetching tasks:", error)
      throw error
    }
  },
  
  // Helper method to generate details for update activities
  _getUpdateDetails(updates: Partial<Task>): string {
    const changedFields = Object.keys(updates).filter(key => key !== 'updatedAt' && key !== 'activities')
    
    if (changedFields.length === 0) {
      return "Task updated"
    }
    
    if (changedFields.length === 1) {
      return `Updated ${changedFields[0]}`
    }
    
    return `Updated ${changedFields.join(', ')}`
  }
}