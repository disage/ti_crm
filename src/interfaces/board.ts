export interface Board {
    title: string;
    icon: string;
    link: string;
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
