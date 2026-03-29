import { createRouter, createWebHistory } from 'vue-router'

const BASE_TITLE = 'Superbird'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: '',
  linkExactActiveClass: '',
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Superbird — Free Tools for Frontend Devs' },
    },
    {
      path: '/scan',
      name: 'scan',
      component: () => import('@/views/ScanView.vue'),
      meta: { title: `Website Scanner — ${BASE_TITLE}` },
    },
    {
      path: '/compress',
      name: 'compress',
      component: () => import('@/views/CompressView.vue'),
      meta: { title: `Image Compressor — ${BASE_TITLE}` },
    },
    {
      path: '/dns',
      name: 'dns',
      component: () => import('@/views/DnsView.vue'),
      meta: { title: `DNS Checker — ${BASE_TITLE}` },
    },
    {
      path: '/api',
      name: 'api',
      component: () => import('@/views/APIView.vue'),
      meta: { title: `API Tester — ${BASE_TITLE}` },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsView.vue'),
      meta: { title: `Terms & Privacy — ${BASE_TITLE}` },
    },
  ],
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) ?? BASE_TITLE
})

export default router
