import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import SingleMenu from '@/views/SingleMenu.vue'
import SingleTask from '@/views/SingleTask.vue'
import SettingsView from '@/views/SettingsView.vue'
import CollaboratorsView from '@/views/CollaboratorsView.vue'
import ProjectCreate from '@/views/ProjectCreate.vue'
import IntegrationsView from '@/views/IntegrationsView.vue'
import TasksView from '@/views/TasksView.vue'
import ContentView from '@/views/ContentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
    },
    {
      path: '/create',
      name: 'create',
      component: ProjectCreate,
    },    
    {
      path: '/menu',
      name: 'single',
      component: SingleMenu,
    },
    {
      path: '/projects/:id',
      name: 'projects-single',
      component: SingleTask,
      props: true
    },
    {
      path: '/projects/:projectId/content/:contentId?',
      name: 'ContentView',
      component: ContentView,
      props: true
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
    },
    {
      path: '/integrations',
      name: 'integrations',
      component: IntegrationsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/collaborators',
      name: 'collaborators',
      component: CollaboratorsView,
    },
  ],
})

export default router