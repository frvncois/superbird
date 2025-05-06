<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'
import TitleMain from '@/components/title/TitleMain.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputToggle from '@/components/input/InputToggle.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import TabNav from '@/components/nav/TabNav.vue'
import AlertUser from '@/components/modal/AlertUser.vue'
import ListPlan from '@/components/list/ListPlan.vue'


const userStore = useUserStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const company = ref('')
const position = ref('')

const initialValues = ref({})
const showAlert = ref(false)
const alertMessage = ref('')

const notifyCompleted = ref(true)
const notifyAssigned = ref(true)
const notifyComment = ref(true)
const notifyMarketing = ref(true)
const notifyNews = ref(true)

const plans = [
  { name: 'BASIC', price: 15, projects: 2, collaborators: 3, storage: '500MB' },
  { name: 'FREELANCER', price: 25, projects: 10, collaborators: 25, storage: '50GB' },
  { name: 'AGENCY', price: 80, projects: 'Unlimited', collaborators: 'Unlimited', storage: '200GB' }
]

const currentPlan = 'FREELANCER' // or pull this from userStore.profile.plan or wherever you store it


// Helpers
function cleanInput(str, max = 100) {
  return String(str || '').trim().substring(0, max)
}
const isValidName = (str) => str.trim().length > 0

function populateFields() {
  const meta = userStore.user?.user_metadata || {}
  const profile = userStore.profile || {}

  firstName.value = meta.first_name || ''
  lastName.value = meta.last_name || ''
  email.value = userStore.user?.email || ''
  company.value = profile.company || ''
  position.value = profile.position || ''

  notifyCompleted.value = profile.notify_task_completed ?? true
  notifyAssigned.value = profile.notify_task_assigned ?? true
  notifyComment.value = profile.notify_comment_added ?? true

  const accepted = userStore.user?.user_metadata?.accepted_communications ?? true
  notifyMarketing.value = profile.notify_marketing_email ?? accepted
  notifyNews.value = profile.notify_news_updates ?? accepted

  initialValues.value = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    company: company.value,
    position: position.value,
    notifyCompleted: notifyCompleted.value,
    notifyAssigned: notifyAssigned.value,
    notifyComment: notifyComment.value,
    notifyMarketing: notifyMarketing.value,
    notifyNews: notifyNews.value
  }
}


watch(() => userStore.profile, (newProfile) => {
  if (newProfile) populateFields()
})

// Save changes
async function handleSave() {
  const cleanedFirst = cleanInput(firstName.value)
  const cleanedLast = cleanInput(lastName.value)
  const cleanedCompany = cleanInput(company.value)
  const cleanedPosition = cleanInput(position.value)
  const fullNameCombined = `${cleanedFirst} ${cleanedLast}`.trim()
  const username = cleanedFirst.toLowerCase()

  if (!isValidName(cleanedFirst) || !isValidName(cleanedLast)) {
    alertMessage.value = 'Please enter a valid name.'
    showAlert.value = true
    return
  }

  const nameChanged =
    cleanedFirst !== initialValues.value.firstName ||
    cleanedLast !== initialValues.value.lastName

  const profileUpdates = {}

  if (nameChanged) {
    profileUpdates.full_name = fullNameCombined
    profileUpdates.username = username
  }

  if (cleanedCompany !== initialValues.value.company)
    profileUpdates.company = cleanedCompany

  if (cleanedPosition !== initialValues.value.position)
    profileUpdates.position = cleanedPosition

  if (notifyCompleted.value !== initialValues.value.notifyCompleted)
    profileUpdates.notify_task_completed = notifyCompleted.value

  if (notifyAssigned.value !== initialValues.value.notifyAssigned)
    profileUpdates.notify_task_assigned = notifyAssigned.value

  if (notifyComment.value !== initialValues.value.notifyComment)
    profileUpdates.notify_comment_added = notifyComment.value

  if (notifyMarketing.value !== initialValues.value.notifyMarketing)
    profileUpdates.notify_marketing_email = notifyMarketing.value

  if (notifyNews.value !== initialValues.value.notifyNews)
    profileUpdates.notify_news_updates = notifyNews.value

  if (!nameChanged && Object.keys(profileUpdates).length === 0) {
    alertMessage.value = 'No changes to save.'
    showAlert.value = true
    return
  }

  try {
    if (nameChanged) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: cleanedFirst,
          last_name: cleanedLast,
        }
      })
      if (metaError) throw metaError
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userStore.user.id)

      if (error) throw error
    }

    await userStore.loadUser()
    alertMessage.value = 'Profile saved successfully!'
    showAlert.value = true
  } catch (err) {
    alertMessage.value = 'Error saving profile: ' + err.message
    showAlert.value = true
  }
}
</script>


<template>
  <main>
    <TitleMain
      title="Settings"
      :button="{
        text: 'Save',
        type: 'save',
        action: handleSave
      }"
    />

    <TabNav :tabs="['Account', 'Plan', 'Notifications']">
      <template #account>
        <ul class="list">
          <TitleSection title="User" />
          <InputNormal label="First name" name="first_name" placeholder="Jane" v-model="firstName" />
          <InputNormal label="Last name" name="last_name" placeholder="Doe" v-model="lastName" />
          <InputNormal label="Email" name="email" type="email" placeholder="you@example.com" v-model="email" />
        </ul>
        <ul class="list">
          <TitleSection title="Organization" />
          <InputNormal label="Company" name="company" placeholder="Your company" v-model="company" />
          <InputNormal label="Position" name="position" placeholder="Your role" v-model="position" />
        </ul>
      </template>

      <template #plan>
        <ul class="list grid-3">
          <ListPlan
            v-for="(plan, i) in plans"
            :key="i"
            :plan="plan"
            :is-active="plan.name === currentPlan"
          />
        </ul>
      </template>


      <template #notifications>
        <ul class="list">
          <TitleSection title="Projects" />
          <InputToggle label="Completed task" note="When a task is completed" v-model="notifyCompleted" />
          <InputToggle label="New assigned task" note="When a task is assigned to you" v-model="notifyAssigned" />
          <InputToggle label="Comment added" note="When a comment is added to a task" v-model="notifyComment" />
        </ul>
        <ul class="list">
          <TitleSection title="Communications" />
          <InputToggle label="Marketing email" note="Occasional promotions and tips" v-model="notifyMarketing" />
          <InputToggle label="News and updates" note="Feature releases and app announcements" v-model="notifyNews" />
        </ul>
      </template>


    </TabNav>

    <AlertUser :message="alertMessage" :show="showAlert" @close="showAlert = false" />
  </main>
</template>
