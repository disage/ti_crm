<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <router-link to="/" style="text-decoration: none; color: inherit;">
            TalentInsight CRM
          </router-link>
        </q-toolbar-title>
        <div>Hello, {{ userStore.user?.name }} </div>
        <q-btn flat dense icon="logout" @click="handleLogout" />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Settings</q-item-label>
      </q-list>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label header class="q-pl-none">Boards</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn size="m" flat dense icon="folder" aria-label="Add folder" @click="openAddFolderDialog" />
          </q-item-section>
          <q-item-section side>
            <q-btn size="m" flat dense icon="add" aria-label="Add board" @click="openBoardModal" />
          </q-item-section>
        </q-item>
        <q-expansion-item v-for="folder in boardStore.folders" :key="folder.name" expand-separator :label="folder.name"
          :caption="folder.type" default-closed :ref="el => setFolderRef(el, folder.id)" @dragover.prevent
          @dragenter.prevent="onDragEnterFolder(folder.id)"
          @dragleave.prevent="(event: DragEvent) => onDragLeaveFolder(folder.id, event)"
          :class="{ 'hovered-folder': hoveredFolderId === folder.id }">
          <template #header>
            <q-item-section avatar>
              <q-btn dense flat round icon="folder" @click.stop.prevent>
                <q-menu anchor="bottom left" self="top left">
                  <q-list style="min-width: 150px">
                    <q-item clickable>
                      <q-item-section>
                        <q-select borderless v-model="folder.type" :options="folderTypes" emit-value map-options
                          @update:model-value="updateFolderType(folder)" label="Change Type" />
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openRenameDialog(folder)">
                      <q-item-section>Rename</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openDeleteDialog(folder)">
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>

            <div @dragenter.prevent="onDragEnterFolder(folder.id)"
              @dragleave.prevent="(event: DragEvent) => onDragLeaveFolder(folder.id, event)"
              class="folder-header-hover-zone">
              <q-item-section>
                <q-item-label @dragenter.prevent="onDragEnterFolder(folder.id)"
                  @dragleave.prevent="(event: DragEvent) => onDragLeaveFolder(folder.id, event)"
                  @drop.prevent="(event: DragEvent) => onDropOnFolder(event, folder.id)">
                  {{ folder.name }}
                </q-item-label>
                <q-item-label caption>
                  {{ folder.type }}
                </q-item-label>
              </q-item-section>
            </div>
          </template>

          <div :ref="el => setFolderContainerRef(folder.id, el)" class="folder-wrapper">
            <draggable :list="folder.boards" group="boards" item-key="id" @change="onBoardDrop($event, folder.id)"
              ghost-class="ghost-board">
              <template #item="{ element }">
                <div class="q-pl-xl" @dragenter.prevent="onDragEnterFolder(folder.id)"
                  @dragleave.prevent="(event: DragEvent) => onDragLeaveFolder(folder.id, event)" draggable
                  @dragstart="onDragStartBoard(element.id)">
                  <EssentialLink v-bind="element" />
                </div>
              </template>
            </draggable>
          </div>

        </q-expansion-item>
        <div ref="rootZoneRef" class="root-drop-zone" :class="{ 'hovered-folder': hoveredFolderId === ROOT_FOLDER_ID }"
          @dragenter.prevent="onDragEnterFolder(ROOT_FOLDER_ID)"
          @dragleave.prevent="(event) => onDragLeaveFolder(ROOT_FOLDER_ID, event)">
          <draggable :list="boardStore.topLevelBoards" group="boards" item-key="id" @change="onBoardDrop($event, null)"
            ghost-class="ghost-board">
            <template #item="{ element }">
              <div @dragenter.prevent="onDragEnterFolder(ROOT_FOLDER_ID)" draggable
                @dragstart="onDragStartBoard(element.id)">
                <EssentialLink v-bind="element" />
              </div>
            </template>
          </draggable>
        </div>

      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="isRenameDialogOpen">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Rename folder</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newFolderName" label="New folder name" autofocus />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="confirmRename" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isDeleteDialogOpen">
      <q-card>
        <q-card-section class="text-h6">
          Delete Folder "{{ activeFolder?.name }}"?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isAddFolderDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add new folder</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newFolderTitle" label="Folder name" autofocus />
          <q-select v-model="newFolderType" :options="folderTypes" label="Folder type" class="q-mt-md" emit-value
            map-options />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Create" color="primary" @click="confirmAddFolder" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isBoardDialogOpen">
      <q-card class="q-pa-md" style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Create Board</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="boardForm.name" label="Board Name" outlined dense class="q-mb-sm" />
          <q-select v-model="boardForm.type" :options="[
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
            { label: 'Shared', value: 'shared' },
          ]" label="Board Type" emit-value map-options outlined dense class="q-mb-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Create" color="primary" @click="handleCreateBoard" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { useRouter } from 'vue-router';

import type { QExpansionItem } from 'quasar';
import draggable from 'vuedraggable';

import { logout } from 'src/api/auth';
import { updateFolder, createBoard } from 'src/api/boards';
import { useBoardStore } from 'src/stores/boardStore';
import { useDialogs } from 'src/composables/useDialogs';
import { useDragAndDrop } from 'src/composables/useDragAndDrop';
import { useUserStore } from 'src/stores/userStore';
import EssentialLink from 'components/EssentialLink.vue';
import type { Folder } from 'src/interfaces/board';

const router = useRouter();
const boardStore = useBoardStore();
const userStore = useUserStore();

const leftDrawerOpen = ref(false);

const folderTypes = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Shared', value: 'shared' }
];

const {
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
} = useDialogs();

const {
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
} = useDragAndDrop();

async function handleLogout() {
  try {
    await logout();
    localStorage.removeItem('accessToken');
    userStore.clearUser();
    await router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function updateFolderType(folder: Folder) {
  try {
    await updateFolder(folder.id, { name: folder.name, type: folder.type });
  } catch (error) {
    console.error('Error', error);
  }
}

async function handleCreateBoard() {
  try {
    await createBoard({
      name: boardForm.value.name,
      icon: 'dashboard',
      type: boardForm.value.type,
      folderId: null,
    });

    isBoardDialogOpen.value = false;
    await boardStore.fetchBoards();
  } catch (error) {
    console.error('Board creation error', error);
  }
}

function setFolderContainerRef(folderId: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    folderContainerRefs.value[folderId] = el;
  } else {
    folderContainerRefs.value[folderId] = null;
  }
}

onMounted(async () => {
  await boardStore.fetchBoards();
});
</script>

<style>
.hovered-folder {
  box-shadow: inset 0 0 0 2px #4285f4;
  background-color: rgba(66, 133, 244, 0.05);
}

.ghost-board {
  opacity: 0.2;
  background-color: var(--q-primary);
  pointer-events: none;
}

.folder-header-hover-zone {
  width: 100%;
}

.root-drop-zone {
  min-height: 60px;
}
</style>