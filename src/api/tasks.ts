import api from './auth';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const tasksAPI = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  update: async (id: string, task: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};