<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1 dark:bg-dark text-center">
        <q-card class="q-pa-lg shadow-2 rounded-borders" style="width: 100%; max-width: 400px">
          <q-card-section>
            <div class="text-h5 text-weight-bold">Sign In</div>
            <div class="text-subtitle2 text-grey">Welcome 👋</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="onLogin" class="q-gutter-md">
              <q-input
                v-model="email"
                type="email"
                label="Email"
                outlined
                dense
                :rules="[(val) => !!val || 'Enter Email']"
              />
              <q-input
                v-model="password"
                type="password"
                label="Password"
                outlined
                dense
                :rules="[(val) => !!val || 'Enter Password']"
              />
              <q-btn
                label="Sign In"
                color="primary"
                type="submit"
                class="full-width"
                :loading="loading"
              />
              <q-banner v-if="error" class="bg-red-1 text-red" rounded dense>
                {{ error }}
              </q-banner>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { login } from 'src/api/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function onLogin() {
  error.value = '';
  loading.value = true;

  try {
    await login({ email: email.value, password: password.value });
    await router.push('/');
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Auth fail';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.q-card {
  transition: box-shadow 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
</style>
