import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getBoardsList } from 'src/api/boards';
import type { Board, Folder } from 'src/interfaces/board';

export const useBoardStore = defineStore('boardStore', () => {
  const folders = ref<Folder[]>([]);
  const topLevelBoards = ref<Board[]>([]);
  const loading = ref(false);

  const fetchBoards = async () => {
    loading.value = true;
    try {
      const response = await getBoardsList();
      folders.value = response.data.folders;
      topLevelBoards.value = response.data.topLevelBoards;
    } catch (error) {
      console.error('Failed to fetch boards', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    folders,
    topLevelBoards,
    loading,
    fetchBoards,
  };
});
