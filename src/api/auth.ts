import { useUserStore } from 'src/stores/userStore';
import api from './api';

export const logout = () => api.post('/auth/logout');

interface LoginPayload {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginPayload) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    const userStore = useUserStore();
    userStore.setUser(user);
  } catch (error) {
    console.error('Login failed', error);
    throw new Error('Login failed');
  }
};
