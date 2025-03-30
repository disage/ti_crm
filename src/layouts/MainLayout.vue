<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          TalentInsight CRM
        </q-toolbar-title>

        <div>Hello</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Settings
        </q-item-label>

        <!-- <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        /> -->
      </q-list>
      <q-list>
        <q-item-label
          header
        >
          Boards
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const linksList: EssentialLinkProps[] = [
  {
    title: 'Interactions',
    caption: 'Sales',
    icon: 'school',
    link: '/board/1'
  },
  {
    title: 'Projects',
    caption: 'Sales',
    icon: 'school',
    link: '/board/2'
  },
  {
    title: 'Delieveries',
    caption: 'Operations',
    icon: 'school',
    link: '/board/3'
  },
  {
    title: 'Payments',
    caption: 'Finance',
    icon: 'money',
    link: '/board/4'
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
