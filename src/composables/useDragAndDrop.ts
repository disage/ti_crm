import { ref } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { moveBoard } from 'src/api/boards';
import type { Board } from 'src/interfaces/board';
import { useBoardStore } from 'src/stores/boardStore';
import type { QExpansionItem } from 'quasar';

export const useDragAndDrop = () => {
  interface DragChangeEvent<T = unknown> {
    added?: {
      element: T;
      newIndex: number;
    };
    removed?: {
      element: T;
      oldIndex: number;
    };
    moved?: {
      element: T;
      oldIndex: number;
      newIndex: number;
    };
  }

  const ROOT_FOLDER_ID = '__ROOT__';

  const boardStore = useBoardStore();

  const rootZoneRef = ref<HTMLElement | null>(null);
  const hoveredFolderId = ref<string | null>(null);
  const draggedBoardId = ref<string | null>(null);
  const dragCounters = ref<Record<string, number>>({});
  const folderRefs = ref<Record<string, ComponentPublicInstance<QExpansionItem> | null>>({});
  const folderContainerRefs = ref<Record<string, HTMLElement | null>>({});
  const isManualDrop = ref(false);

  function cleanupDragState() {
    hoveredFolderId.value = null;
    draggedBoardId.value = null;
    dragCounters.value = {};
  }

  async function onBoardDrop(evt: DragChangeEvent<Board>, targetFolderId: string | null) {
    if (isManualDrop.value) {
      console.log('Skipping onBoardDrop because manual drop happened');
      isManualDrop.value = false;
      cleanupDragState();
      return;
    }
    const movedBoard = evt.moved?.element || evt.added?.element;
    const newIndex = evt.moved?.newIndex ?? evt.added?.newIndex ?? 0;

    if (!movedBoard) {
      cleanupDragState();
      return;
    }

    try {
      await moveBoard(movedBoard.id, {
        folderId: targetFolderId,
        order: newIndex,
      });
      await boardStore.fetchBoards();
    } catch (error) {
      console.error('Error updating board folder or order:', error);
    } finally {
      cleanupDragState();
    }
  }

  function setFolderRef(el: unknown, folderId: string) {
    if (el && typeof el === 'object' && '$attrs' in el) {
      folderRefs.value[folderId] = el as ComponentPublicInstance<QExpansionItem>;
    }
  }

  function onDragLeaveFolder(folderId: string, event: DragEvent) {
    dragCounters.value[folderId] = (dragCounters.value[folderId] || 1) - 1;

    if (dragCounters.value[folderId] <= 0) {
      delete dragCounters.value[folderId];

      const container =
        folderId === ROOT_FOLDER_ID ? rootZoneRef.value : folderContainerRefs.value[folderId];

      if (
        !container ||
        !event.relatedTarget ||
        (!container.contains(event.relatedTarget as Node) &&
          !(event.relatedTarget as HTMLElement).classList.contains('ghost-board'))
      ) {
        hoveredFolderId.value = null;
        const folderItem = folderRefs.value[folderId];
        folderItem?.hide?.();
      }
    }
  }

  function onDragStartBoard(boardId: string) {
    draggedBoardId.value = boardId;
  }

  function onDragEnterFolder(folderId: string | null) {
    dragCounters.value[folderId ?? 'null'] = (dragCounters.value[folderId ?? 'null'] || 0) + 1;
    hoveredFolderId.value = folderId;

    const folderItem = folderId ? folderRefs.value[folderId] : null;
    folderItem?.show?.();
  }

  async function onDropOnFolder(event: DragEvent, folderId: string) {
    event.preventDefault();
    if (draggedBoardId.value) {
      isManualDrop.value = true;
      await manualMoveBoard(draggedBoardId.value, folderId);
    }
  }

  async function manualMoveBoard(boardId: string, targetFolderId: string) {
    try {
      await moveBoard(boardId, {
        folderId: targetFolderId,
        order: 0,
      });
      await boardStore.fetchBoards();
    } catch (error) {
      console.error('Error manually moving board:', error);
    } finally {
      draggedBoardId.value = null;
      cleanupDragState();
    }
  }

  return {
    folderContainerRefs,
    hoveredFolderId,
    onBoardDrop,
    onDragEnterFolder,
    onDragLeaveFolder,
    onDragStartBoard,
    onDropOnFolder,
    ROOT_FOLDER_ID,
    rootZoneRef,
    setFolderRef,
  };
};
