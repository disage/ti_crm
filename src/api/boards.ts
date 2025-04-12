import api from './api';
import type { Folder, FolderType, CreateFolderDTO } from 'src/interfaces/board';

export const getBoardsList = () => api.get<Folder[]>('/boards');

export const deleteFolder = (id: string) => api.delete(`/boards/folder/${id}`);

export const createFolder = async (dto: CreateFolderDTO) => {
  const response = await api.post('/boards/folder', dto);
  return response.data;
};

export const updateFolder = (id: string, data: { name: string; type: FolderType }) => api.patch(`/boards/folder/${id}`, data);
