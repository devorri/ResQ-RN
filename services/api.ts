import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const incidentService = {
  create: async (formData: FormData) => {
    const response = await api.post('/incidents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (params?: Record<string, string>) => {
    const response = await api.get('/incidents', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  accept: async (id: number) => {
    const response = await api.post(`/incidents/${id}/accept`);
    return response.data;
  },
  updateStatus: async (id: number, data: { status: string; message?: string }) => {
    const response = await api.post(`/incidents/${id}/update-status`, data);
    return response.data;
  },
  complete: async (id: number, notes: string) => {
    const response = await api.post(`/incidents/${id}/complete`, { resolution_notes: notes });
    return response.data;
  },
  cancel: async (id: number, reason: string) => {
    const response = await api.post(`/incidents/${id}/cancel`, { reason });
    return response.data;
  },
};

export const trackingService = {
  updateLocation: async (data: {
    incident_id: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }) => {
    const response = await api.post('/tracking/update-location', data);
    return response.data;
  },
  getRoute: async (incidentId: number) => {
    const response = await api.get(`/tracking/incident/${incidentId}/route`);
    return response.data;
  },
};

export const stationService = {
  getAll: async (params?: { type?: string; latitude?: number; longitude?: number }) => {
    const response = await api.get('/stations', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/stations/${id}`);
    return response.data;
  },
};
