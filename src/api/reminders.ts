import api from './auth';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  reminderTime: string;
  isCompleted: boolean;
  taskId?: string;
  createdAt: string;
}

export const remindersAPI = {
  getAll: async (): Promise<Reminder[]> => {
    const response = await api.get('/reminders');
    return response.data;
  },

  create: async (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const response = await api.post('/reminders', reminder);
    return response.data;
  },

  update: async (id: string, reminder: Partial<Reminder>) => {
    const response = await api.put(`/reminders/${id}`, reminder);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/reminders/${id}`);
  },

  markCompleted: async (id: string) => {
    const response = await api.patch(`/reminders/${id}/complete`);
    return response.data;
  },
};