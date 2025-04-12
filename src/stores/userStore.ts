import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref<{ name: string; role: string; imgUrl: string } | null>(null);

  const setUser = (userData: { name: string; role: string; imgUrl: string }) => {
    user.value = userData;
  };

  const clearUser = () => {
    user.value = null;
  };

  return {
    user,
    setUser,
    clearUser,
  };
});