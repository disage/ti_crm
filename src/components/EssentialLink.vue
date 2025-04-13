<template>
  <q-item
    clickable
    tag="router-link"
    :to="`/board/${id}`"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ name }}</q-item-label>
      <q-item-label caption>{{ type }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'dashboard'
  }
});
</script>
