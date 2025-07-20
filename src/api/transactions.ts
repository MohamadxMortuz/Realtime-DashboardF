import api from './auth';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export const transactionsAPI = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },

  create: async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  update: async (id: string, transaction: Partial<Transaction>) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`);
  },

  getSummary: async () => {
    const response = await api.get('/transactions/summary');
    return response.data;
  },
};