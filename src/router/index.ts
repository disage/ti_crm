import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { fetchCurrentUserData } from '../api/users';
import { useUserStore } from '../stores/userStore';

function isAuthenticated(): boolean {
  const token = localStorage.getItem('accessToken');
  return !!token;
}

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    if (to.meta.requiresAuth && !isAuthenticated()) {
      next({ name: 'Login' });
      return;
    }

    if (!userStore.user && isAuthenticated()) {
      try {
        const userData = await fetchCurrentUserData();
        userStore.setUser(userData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    next();
  });

  return Router;
});
