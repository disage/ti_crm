<template>
  <div>
    <q-btn label="GetUsers" color="primary" class="full-width" @click="getUsers" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import api from 'src/api/api';


const loading = ref(false);
const error = ref('');

async function getUsers() {

  error.value = '';
  loading.value = true;

  try {
    const response = await api.get('/users');
    console.log(response.data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Error';
    }
  } finally {
    loading.value = false;
  }
}
</script>