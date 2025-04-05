<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          TalentInsight CRM
        </q-toolbar-title>

        <div>Hello</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Settings
        </q-item-label>
      </q-list>

      <q-list>
        <q-item-label header>
          Boards
        </q-item-label>
        <q-expansion-item v-for="folder in boardsFolders" :key="folder.title" expand-separator :label="folder.title"
          :caption="folder.caption" default-closed>
          <EssentialLink v-for="board in folder.boards" :key="board.title" v-bind="board" />
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';

const boardsFolders = [
  {
    id: 1,
    title: 'Sales Dept',
    caption: '3 boards',
    boards: [
      {
        title: 'Contacts',
        icon: 'add_reaction',
        link: '/board/1'
      },
      {
        title: 'Projects',
        icon: 'work',
        link: '/board/2'
      },
      {
        title: 'Companies',
        icon: 'money',
        link: '/board/4'
      },
      {
        title: 'Interactions',
        icon: 'add_reaction',
        link: '/board/5'
      },
      {
        title: 'Trainers',
        icon: 'add_reaction',
        link: '/board/6'
      },
      {
        title: 'Employees',
        icon: 'add_reaction',
        link: '/board/7'
      },
      {
        title: 'Products',
        icon: 'add_reaction',
        link: '/board/8'
      }
    ]
  },
  {
    id: 2,
    title: 'Finance Dept',
    caption: '2 boards',
    boards: [
      {
        title: 'Payment for Trainers',
        icon: 'add_reaction',
        link: '/board/9'
      },
      {
        title: 'Payment for Products',
        icon: 'work',
        link: '/board/10'
      }
    ]
  },
  {
    id: 3,
    title: 'Operation Dept',
    caption: '3 boards',
    boards: [
      {
        title: 'Contracts',
        icon: 'list',
        link: '/board/11'
      },
      {
        title: 'Delieveries for Campanies projects',
        icon: 'local_shipping',
        link: '/board/12'
      },
      {
        title: 'Delieveries for ACTC/CTPC/Reading Club/Others',
        icon: 'local_shipping',
        link: '/board/13'
      }
    ]
    
  },
]



const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
