<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/lib/userStore'

import TitleMain from '@/components/title/TitleMain.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import ListIntegration from '@/components/list/ListIntegration.vue'

const userStore = useUserStore()

const integrations = {
  management: [
    { id: 'trello', title: 'Trello', details: 'Sync cards with your tasks' },
    { id: 'monday', title: 'Monday.com', details: 'Collaborate via Monday boards' },
    { id: 'asana', title: 'Asana', details: 'Link your Asana tasks' },
    { id: 'notion', title: 'Notion', details: 'Push project data into Notion' },
    { id: 'jira', title: 'Jira', details: 'Track development tasks in Jira' },
  ],
  communication: [
    { id: 'slack', title: 'Slack', details: 'Get notifications or add tasks via Slack' },
    { id: 'teams', title: 'Microsoft Teams', details: 'Get updates and create tasks in Teams' },
    { id: 'discord', title: 'Discord', details: 'Notify channels with updates' },
  ],
  storage: [
    { id: 'gdrive', title: 'Google Drive', details: 'Attach files from Google Drive' },
    { id: 'dropbox', title: 'Dropbox', details: 'Access files from Dropbox' },
    { id: 'onedrive', title: 'OneDrive', details: 'Connect files from Microsoft OneDrive' },
  ],
  calendar: [
    { id: 'gcal', title: 'Google Calendar', details: 'Sync task deadlines with Google Calendar' },
    { id: 'outlook', title: 'Outlook Calendar', details: 'Connect deadlines to Outlook' },
    { id: 'apple', title: 'Apple Calendar', details: 'Apple sync for events and tasks' },
    { id: 'calendly', title: 'Calendly', details: 'Schedule and sync meetings with tasks' },
  ],
}

onMounted(async () => {
  if (!userStore.user) await userStore.loadUser()
})
</script>

<template>
  <main>
    <TitleMain title="Integrations" />

    <ul class="list">
      <TitleSection title="Management" toggle="Automate your workflow" />
      <ListIntegration v-for="integration in integrations.management" :key="integration.id" :integration="integration" />
    </ul>

    <ul class="list">
      <TitleSection title="Communication" toggle="Stay in the loop" />
      <ListIntegration v-for="integration in integrations.communication" :key="integration.id" :integration="integration" />
    </ul>

    <ul class="list">
      <TitleSection title="Storage" toggle="Access project files" />
      <ListIntegration v-for="integration in integrations.storage" :key="integration.id" :integration="integration" />
    </ul>

    <ul class="list">
      <TitleSection title="Calendar" toggle="Stay on schedule" />
      <ListIntegration v-for="integration in integrations.calendar" :key="integration.id" :integration="integration" />
    </ul>
  </main>
</template>
