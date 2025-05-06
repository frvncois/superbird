<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

import TitleCraft from '@/components/title/TitleCraft.vue'

// Get route params
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectId = route.params.projectId
const contentId = route.params.contentId

// State management
const title = ref('')
const showList = ref(false)
const loading = ref(true)
const currentContent = ref(null)

// Set up the editor
const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
    Underline,
    TextStyle,
    Color,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Start writing your content...' }),
  ],
  content: '',
})

// Fetch content if we have an ID
async function fetchContent() {
  if (!contentId) {
    loading.value = false
    return
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (error) throw error

    currentContent.value = data
    title.value = data.title || ''
    editor.value?.commands.setContent(data.html || '')
  } catch (error) {
    console.error('Error fetching content:', error)
  } finally {
    loading.value = false
  }
}

// Watch for changes to contentId
watch(
  () => route.params.contentId,
  (newContentId) => {
    if (newContentId) {
      loading.value = true
      fetchContent()
    } else {
      // Reset for new content
      currentContent.value = null
      title.value = ''
      editor.value?.commands.setContent('')
      loading.value = false
    }
  },
  { immediate: true }
)

// Editor functions
function setLink() {
  const url = prompt('Enter link URL:')
  if (url) {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

function unsetLink() {
  editor.value?.chain().focus().unsetLink().run()
}

// Save content to database
async function saveContent() {
  if (!userStore.user) await userStore.loadUser()
  const html = editor.value?.getHTML() || ''

  const payload = {
    project_id: projectId,
    title: title.value || 'Untitled',
    html,
    updated_by: userStore.user.id,
  }

  let savedContent = null

  if (currentContent.value) {
    // Update existing content
    const { data, error } = await supabase
      .from('content')
      .update(payload)
      .eq('id', currentContent.value.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to update content:', error)
      return
    }

    savedContent = data
    console.log('✅ Content updated:', savedContent)
  } else {
    // Create new content
    payload.created_by = userStore.user.id
    const { data, error } = await supabase
      .from('content')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to insert content:', error)
      return
    }

    savedContent = data
    console.log('✅ Content saved:', savedContent)
  }

  // Update userStore.content
  if (!userStore.content[projectId]) userStore.content[projectId] = []

  const index = userStore.content[projectId].findIndex(c => c.id === savedContent.id)
  if (index !== -1) {
    userStore.content[projectId][index] = savedContent
  } else {
    userStore.content[projectId].push(savedContent)
  }

  // Navigate back to project view
  navigateBack()
}

// Return to project page
function navigateBack() {
  router.push(`/projects/${projectId}`)
}

// Get content from iframe if needed
function getIframeContent() {
  const iframe = document.querySelector('iframe')
  
  if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) {
    console.warn('❌ Iframe is not accessible')
    return
  }

  const rawText = iframe.contentDocument.body.innerText.trim()

  if (editor.value && rawText) {
    const paragraphs = rawText.split('\n').filter(p => p.trim())
    const html = paragraphs.map(p => `<p>${p}</p>`).join('')
    editor.value.commands.setContent(html)
  }
}

onMounted(() => {
  if (!userStore.loaded) {
    userStore.loadUser()
  }
})
</script>

<template>
  <main>
    <div v-if="loading" class="loading">Loading content...</div>
    
    <div v-else>
      <TitleCraft
        v-model:title="title"
        :button-primary="{ text: 'Save', type: 'add', action: saveContent }"
        :button-secondary="{ text: 'Back', type: 'quit', action: navigateBack }"
      />

      <button @click="getIframeContent" class="iframe-button">Get preview content</button>

      <div class="toolbar">
        <button @click="editor.chain().focus().setParagraph().run()">P</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>

        <button @click="editor.chain().focus().toggleBold().run()">B</button>
        <button @click="editor.chain().focus().toggleItalic().run()">I</button>
        <button @click="editor.chain().focus().toggleUnderline().run()">U</button>
        <button @click="editor.chain().focus().toggleStrike().run()">S</button>

        <button @click="editor.chain().focus().toggleBulletList().run()">LI</button>
        <button @click="setLink">Link</button>
        <button @click="unsetLink">Unlink</button>
      </div>

      <div class="editor">
        <EditorContent :editor="editor" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #888;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 0;
}

.editor {
  background: #111;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--is-border, #333);
  min-height: 300px;
  margin-top: 1rem;
}

button {
  background: #222;
  color: white;
  border: 1px solid #444;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #333;
}

.iframe-button {
  margin-bottom: 1rem;
  background: #2a2a2a;
}
</style>