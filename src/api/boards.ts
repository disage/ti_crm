import api from './api';
import type { Board, CreateFolderDTO, BoardsResponse, FolderType } from 'src/interfaces/board';

export const getBoardsList = () => api.get<BoardsResponse>('/boards');

export const deleteFolder = (id: string) => api.delete(`/boards/folder/${id}`);

export const deleteBoard = (id: string) => api.delete(`/boards/${id}`);

export const createFolder = async (dto: CreateFolderDTO) => {
  const response = await api.post('/boards/folder', dto);
  return response.data;
};

export const updateFolder = (id: string, data: { name: string; type: FolderType }) => api.patch(`/boards/folder/${id}`, data);

export function createBoard(data: { name: string; icon: string, type: Board['type']; folderId?: string | null }) {
  return api.post<Board>('/boards', data);
}

export async function moveBoard(boardId: string, data: { folderId: string | null; order: number }) {
  return api.patch(`/boards/move/${boardId}`, data);
}