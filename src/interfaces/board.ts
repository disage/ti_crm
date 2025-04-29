export type BoardType = 'private' | 'shared' | 'public';

export interface Board {
  id: string;
  name: string;
  type: BoardType;
  folderId?: string | null;
  icon?: string;
}

export interface UpdateBoardDto {
  name?: string;
  type?: BoardType;
}

export interface Folder {
  id: string;
  name: string;
  order: number;
  ownerId: string;
  type: FolderType;
  boards: Board[];
}

export interface CreateFolderDTO {
  name: string;
  order: number;
  type: FolderType;
}

export type FolderType = 'private' | 'public' | 'shared';

export interface BoardsResponse {
  folders: Folder[];
  topLevelBoards: Board[];
}

export interface Column {
  id: string;
  name: string;
  label: string;
  field: string;
  align: 'left' | 'right' | 'center';
  width: number;
  type: 'text' | 'number' | 'select' | 'date';
  options?: [];
}

export interface Row {
  id: string;
  [key: string]: unknown;
}

export interface BoardResponse {
  id: string;
  name: string;
  type: string;
  icon: string;
  ownerId: string;
  columns: Column[];
  rows: Row[];
}

export interface CreateBoardColumn {
  boardId: string;
  name: string;
  // type: ColumnType;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE';
  order?: number;
  settings?: object;
}
