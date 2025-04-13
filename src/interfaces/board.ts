export type BoardType = 'private' | 'shared' | 'public';

export interface Board {
  id: string;
  name: string;
  type: BoardType;
  folderId?: string | null;
  icon?: string;
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