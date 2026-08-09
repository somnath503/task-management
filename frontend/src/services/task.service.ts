import api from "@/lib/api";

// We can define our TypeScript interfaces here for strict typing across the frontend
export interface Task {
  id: string;
  fullName: string;
  lastName: string;
  iepDue?: string;
  evalDue?: string;
  collaborators?: string;
  serviceTime?: string;
  school?: string;
  createdAt: string;
  updatedAt: string;
}

export const taskService = {
  // Fetch all tasks
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get("/tasks");
    return response.data;
  },

  // Fetch a single task by ID
  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  // Update an existing task
  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};