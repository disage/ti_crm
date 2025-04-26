import { ref } from 'vue';
import type { BoardType, Folder, FolderType } from '../interfaces/board';
import { deleteFolder, createFolder, updateFolder } from 'src/api/boards';
import { useBoardStore } from 'src/stores/boardStore';

export function useDialogs() {
  const boardStore = useBoardStore();

  const activeFolder = ref<Folder | null>(null);
  const newFolderName = ref(''); //for edit modal
  const newFolderTitle = ref(''); //for add modal
  const newFolderType = ref<FolderType>('public');
  const boardForm = ref<{ name: string; type: BoardType }>({ name: '', type: 'public' });

  const isAddFolderDialogOpen = ref(false);
  const isRenameDialogOpen = ref(false);
  const isDeleteDialogOpen = ref(false);
  const isBoardDialogOpen = ref(false);

  const openRenameDialog = (folder: Folder) => {
    activeFolder.value = folder;
    newFolderName.value = folder.name;
    isRenameDialogOpen.value = true;
  }

  const openDeleteDialog = (folder: Folder) => {
    activeFolder.value = folder;
    isDeleteDialogOpen.value = true;
  }

  const openAddFolderDialog = () => {
    newFolderTitle.value = '';
    isAddFolderDialogOpen.value = true;
  }

  const openBoardModal = () => {
    boardForm.value = { name: '', type: 'public' };
    isBoardDialogOpen.value = true;
  }

  const confirmRename = async () => {
    if (activeFolder.value) {
      activeFolder.value.name = newFolderName.value.trim();
      await updateFolder(activeFolder.value.id, { name: activeFolder.value.name, type: activeFolder.value.type })
    }
    isRenameDialogOpen.value = false;
  }

  const confirmDelete = async () => {
    if (activeFolder.value) {
      try {
        await deleteFolder(activeFolder.value.id);
        await boardStore.fetchBoards();
      } catch (error) {
        console.error('Error', error);
      } finally {
        isDeleteDialogOpen.value = false;
      }
    }
  }

  const confirmAddFolder = async () => {
    if (newFolderTitle.value.trim()) {
      const dto = {
        name: newFolderTitle.value.trim(),
        order: boardStore.folders.length + 1,
        type: newFolderType.value,
        visibleToUserIds: [],
      };

      try {
        await createFolder(dto);
        await boardStore.fetchBoards();
      } catch (error) {
        console.error('Error during adding folder:', error);
      } finally {
        isAddFolderDialogOpen.value = false;
        newFolderTitle.value = '';
      }
    } else {
      console.log('Enter folder name');
    }
  }

  return {
    activeFolder,
    isAddFolderDialogOpen,
    isBoardDialogOpen,
    boardForm,
    confirmAddFolder,
    confirmDelete,
    confirmRename,
    isDeleteDialogOpen,
    newFolderName,
    newFolderTitle,
    newFolderType,
    openAddFolderDialog,
    openBoardModal,
    openDeleteDialog,
    openRenameDialog,
    isRenameDialogOpen,
  };
}
