<template>
  <div class="q-pa-md flex justify-between">
    <q-card class="q-pa-md user-list_section" style="max-height: 350px; overflow-y: auto;">
      <q-card-section class="q-flex flex justify-between">
        <div class="text-h6">Users List</div>
        <q-btn icon="add" round flat color="primary" @click="openAddModal" />
      </q-card-section>
      <q-separator />
      <q-list bordered>
        <q-item v-for="user in users" :key="user.id" clickable class="q-my-sm">
          <q-item-section avatar>
            <q-avatar size="42px">
              <img :src="user.imgUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption>{{ roleLabels[user.role] }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon="settings" @click.stop="openEditModal(user)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    <q-dialog v-model="editDialog">
      <q-card class="q-pa-md" style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Edit User</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="editUser.name" label="Name" dense outlined class="q-mb-sm" />
          <q-input v-model="editUser.email" label="Email" dense outlined disable class="q-mb-sm" />
          <q-select v-model="editUser.role" :options="roleOptions" option-value="value" option-label="label" emit-value
            label="Role" dense outlined />
          <q-card-actions>
            <q-btn flat label="Delete" color="negative" @click="confirmDelete" class="q-mr-xs" />

            <div style="flex-grow: 1; display: flex; justify-content: flex-end;">
              <q-btn flat label="Cancel" color="primary" v-close-popup class="q-mr-xs" />
              <q-btn flat label="Save" color="primary" @click="saveEdit" />
            </div>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addDialog">
      <q-card class="q-pa-md" style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Add New User</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newUser.email" label="Email" dense outlined class="q-mb-sm" />
          <q-input v-model="newUser.password" label="Password" type="password" dense outlined class="q-mb-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Add" color="primary" @click="addUserHandler" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDialog">
      <q-card class="q-pa-md">
        <q-card-section class="text-h6">Confirm Deletion</q-card-section>
        <q-card-section>Are you sure you want to delete this user?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="red" @click="deleteUserHandler" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import type { User, NewUser } from 'src/interfaces/user';
import { UserRole } from 'src/interfaces/user';
import { getUsers, addUser, updateUser, deleteUser } from 'src/api/users';
import { roleLabels, roleOptions } from 'src/constants/user';

const users = ref<User[]>([]);
const error = ref('');
const editDialog = ref(false);
const addDialog = ref(false);
const confirmDialog = ref(false);

const editUser = ref<User>({
  id: '',
  name: '',
  email: '',
  imgUrl: '',
  role: UserRole.User,
});

const newUser = ref<NewUser>({
  email: '',
  password: '',
});

function openEditModal(user: User) {
  editUser.value = { ...user };
  editDialog.value = true;
}

function openAddModal() {
  newUser.value = { email: '', password: '' };
  addDialog.value = true;
}

function confirmDelete() {
  confirmDialog.value = true;
}

async function deleteUserHandler() {
  if (!editUser.value.id) return;

  try {
    await deleteUser(editUser.value.id);
    users.value = users.value.filter(u => u.id !== editUser.value.id);
    confirmDialog.value = false;
    editDialog.value = false;
  } catch (err) {
    console.error('Error during deleting:', err);
  }
}

async function saveEdit() {
  try {
    await updateUser(editUser.value.id, {
      name: editUser.value.name,
      role: editUser.value.role,
    });

    const index = users.value.findIndex(u => u.id === editUser.value.id);
    if (index !== -1) {
      const user = users.value[index];
      if (user) {
        user.name = editUser.value.name;
        user.role = editUser.value.role;
      }
    }

    editDialog.value = false;
  } catch (err) {
    console.error('Error during saving:', err);
  }
}

async function addUserHandler() {
  try {
    await addUser(newUser.value);
    await fetchUsers();
    addDialog.value = false;
  } catch (err) {
    console.error('Error during adding user:', err);
  }
}

async function fetchUsers() {
  try {
    const response = await getUsers();
    users.value = response.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Error';
    }
  }
}

onMounted(fetchUsers);
</script>

<style>
.user-list_section {
  width: 30%;
}

@media (max-width: 1100px) {
  .user-list_section {
    width: 50%;
  }
}

@media (max-width: 640px) {
  .user-list_section {
    width: 100%;
  }
}
</style>