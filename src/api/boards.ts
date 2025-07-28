import api from './api';
import type {
  Board,
  CreateFolderDTO,
  BoardsResponse,
  FolderType,
  BoardResponse,
  CreateBoardColumn,
  UpdateBoardDto,
  UpdateColumnPayload,
} from 'src/interfaces/board';

// BOARD

export function createBoard(data: {
  name: string;
  icon: string;
  type: Board['type'];
  folderId?: string | null;
}) {
  return api.post<Board>('/boards', data);
}

export const getBoardsList = () => api.get<BoardsResponse>('/boards');

export const getBoardById = async (id: string): Promise<BoardResponse> => {
  return api.get(`/boards/${id}`).then((response) => response.data);
};

export async function moveBoard(boardId: string, data: { folderId: string | null; order: number }) {
  return api.patch(`/boards/move/${boardId}`, data);
}

export const updateBoard = (id: string, data: UpdateBoardDto) => {
  return api.patch(`/boards/${id}`, data);
};

export const deleteBoard = (id: string) => api.delete(`/boards/${id}`);

// FOLDER

export const createFolder = async (dto: CreateFolderDTO) => {
  const response = await api.post('/boards/folder', dto);
  return response.data;
};

export const updateFolder = (id: string, data: { name: string; type: FolderType }) =>
  api.patch(`/boards/folder/${id}`, data);

export const deleteFolder = (id: string) => api.delete(`/boards/folder/${id}`);

// COLUMN

export const createBoardColumn = (data: CreateBoardColumn) => {
  return api.post('/board/column', data);
};

export const updateColumn = (id: string, data: UpdateColumnPayload) => {
  return api.patch(`/board/column/${id}`, data);
};

export const deleteBoardColumn = (id: string) => api.delete(`/board/column/${id}`);

// ROW

export const createBoardRow = (boardId: string) => {
  return api.post('/board/row', { boardId });
};

export const deleteBoardRow = (id: string) => api.delete(`/board/row/${id}`);

// CELL
export const updateBoardCell = (id: string, value: string | number | null) => {
  return api.patch(`/board/cell/${id}`, { value });
};

export const getBoardCell = (rowId: string, columnId: string) => {
  return api.get('/board/cell', {
    params: { rowId, columnId },
  });
};
