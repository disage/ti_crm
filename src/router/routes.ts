import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'board/:boardId',
        name: 'Board',
        component: () => import('pages/BoardPage.vue'),
        props: true,
      },
    ],
    meta: { requiresAuth: true },
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/LoginPage.vue'),
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
