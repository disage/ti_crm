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
  type: 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'DATE';
  settings?: {
    options?: string[];
    [key: string]: unknown;
  };
}

export interface Row {
  id: string;
  [key: string]: CellData | string;
}

export interface CellData {
  value: string | number | null;
  originalValue: string | number | null;
  cellId: string;
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
  type: 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'DATE';
  order?: number;
  settings?: {
    options?: string[];
    [key: string]: unknown;
  };
}

export interface UpdateColumnPayload {
  name?: string;
  type?: 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'DATE';
  settings?: {
    options?: string[];
    [key: string]: unknown;
  };
}

export interface Cell {
  id: string;
  columnId: string;
  value: unknown;
}
