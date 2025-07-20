import api from './auth';

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  timestamp: string;
  trend?: 'up' | 'down' | 'stable';
}

export const metricsAPI = {
  getAll: async (): Promise<Metric[]> => {
    const response = await api.get('/metrics');
    return response.data;
  },

  create: async (metric: Omit<Metric, 'id' | 'timestamp'>) => {
    const response = await api.post('/metrics', metric);
    return response.data;
  },

  update: async (id: string, metric: Partial<Metric>) => {
    const response = await api.put(`/metrics/${id}`, metric);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/metrics/${id}`);
  },
};