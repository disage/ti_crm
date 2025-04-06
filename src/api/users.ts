import api from './api';
import type { NewUser, User, UserRole } from 'src/interfaces/user';

export const getUsers = () => api.get<User[]>('/users');

export const addUser = (data: NewUser) => api.post('/users', data);

export const updateUser = (id: string, data: { name: string; role: UserRole }) =>
  api.patch(`/users/${id}`, data);

export const deleteUser = (id: string) => api.delete(`/users/${id}`);
