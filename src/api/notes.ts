import api from './auth';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const notesAPI = {
  getAll: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },

  create: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/notes', note);
    return response.data;
  },

  update: async (id: string, note: Partial<Note>) => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/notes/${id}`);
  },
};