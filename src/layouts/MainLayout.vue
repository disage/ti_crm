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
        <div>Hello, {{ userStore.user?.name}} </div>
        <q-btn flat dense icon="logout" @click="handleLogout" />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Settings
        </q-item-label>
      </q-list>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label header class="q-pl-none">Boards</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn size="sm" flat dense icon="folder" @click="openAddFolderDialog" aria-label="Add folder" />
          </q-item-section>
          <q-item-section side>
            <q-btn size="sm" flat dense icon="add" aria-label="Add board" />
          </q-item-section>
        </q-item>
        <q-expansion-item v-for="folder in boardsFolders" :key="folder.name" expand-separator :label="folder.name"
          :caption="folder.type" default-closed>
          <template #header>
            <q-item-section avatar>
              <q-btn dense flat round icon="folder" @click.stop.prevent>
                <q-menu anchor="bottom left" self="top left">
                  <q-list style="min-width: 150px">
                    <q-item clickable>
                      <q-item-section>
                        <q-select borderless v-model="folder.type" :options="folderTypes" emit-value map-options
                          @update:model-value="updateFolderType(folder)" label="Change Type" /> </q-item-section>
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
            <q-item-section>
              <q-item-label>{{ folder.name }}</q-item-label>
              <q-item-label caption>{{ folder.type }}</q-item-label>
            </q-item-section>
          </template>
          <EssentialLink v-for="board in folder.boards" :key="board.title" v-bind="board" />
        </q-expansion-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="renameDialogOpen">
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
    <q-dialog v-model="deleteDialogOpen">
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
    <q-dialog v-model="addFolderDialogOpen">
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
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import EssentialLink from 'components/EssentialLink.vue';
import { getBoardsList, deleteFolder, createFolder, updateFolder } from 'src/api/boards';
import { logout } from 'src/api/auth';
import { useUserStore } from 'src/stores/userStore';
import type { Folder, FolderType } from 'src/interfaces/board';

const router = useRouter();
const userStore = useUserStore();

const addFolderDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const leftDrawerOpen = ref(false);
const renameDialogOpen = ref(false);

const activeFolder = ref<Folder | null>(null);
const newFolderName = ref(''); //for edit modal
const newFolderTitle = ref(''); //for add modal
const newFolderType = ref<FolderType>('public');

const boardsFolders = ref<Folder[]>([]);

const folderTypes = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Shared', value: 'shared' }
];

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

function openRenameDialog(folder: Folder) {
  activeFolder.value = folder;
  newFolderName.value = folder.name;
  renameDialogOpen.value = true;
}

function openDeleteDialog(folder: Folder) {
  activeFolder.value = folder;
  deleteDialogOpen.value = true;
}

async function confirmRename() {
  if (activeFolder.value) {
    activeFolder.value.name = newFolderName.value.trim();
    await updateFolder(activeFolder.value.id, { name: activeFolder.value.name, type: activeFolder.value.type })
  }
  renameDialogOpen.value = false;
}

async function confirmDelete() {
  if (activeFolder.value) {
    try {
      await deleteFolder(activeFolder.value.id);
      await fetchFolders();
    } catch (error) {
      console.error('Error', error);
    } finally {
      deleteDialogOpen.value = false;
    }
  }
}

async function updateFolderType(folder: Folder) {
  try {
    await updateFolder(folder.id, { name: folder.name, type: folder.type });
  } catch (error) {
    console.error('Error', error);
  }
}

function openAddFolderDialog() {
  newFolderTitle.value = '';
  addFolderDialogOpen.value = true;
}

async function confirmAddFolder() {
  if (newFolderTitle.value.trim()) {
    const dto = {
      name: newFolderTitle.value.trim(),
      order: boardsFolders.value.length + 1,
      type: newFolderType.value,
      visibleToUserIds: [],
    };

    try {
      const newFolder = await createFolder(dto);
      boardsFolders.value.push(newFolder);
    } catch (error) {
      console.error('Error during adding folder:', error);
    } finally {
      addFolderDialogOpen.value = false;
      newFolderTitle.value = '';
      // newFolderType.value = '';
    }
  } else {
    console.log('Enter folder name');
  }
}

async function fetchFolders() {
  try {
    const response = await getBoardsList();
    boardsFolders.value = response.data.map((folder: Folder) => ({
      id: folder.id,
      name: folder.name,
      order: folder.order,
      ownerId: folder.ownerId,
      type: folder.type,
      boards: []
    }));
  } catch (error) {
    console.error('Failed to fetch folders:', error);
  }
}

onMounted(async () => {
  await fetchFolders();
});
</script>
