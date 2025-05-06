<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

const emit = defineEmits(['close'])

const route = useRoute()
const userStore = useUserStore()
const projectId = route.params.id

const files = ref([])
const error = ref(null)
const isUploading = ref(false)

// Allowed MIME types
const acceptedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'application/msword',
  'text/plain',
  'video/webm'
]

function sanitizeFileName(name) {
  return name.replace(/[^\w.\-]/g, '_')
}

function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
}

function handleDrop(event) {
  preventDefaults(event)
  const droppedFiles = Array.from(event.dataTransfer.files)
  addFiles(droppedFiles)
}

function handleFileInput(event) {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
}

function addFiles(newFiles) {
  const valid = newFiles.filter(f => acceptedTypes.includes(f.type))
  const invalid = newFiles.filter(f => !acceptedTypes.includes(f.type))

  if (invalid.length > 0) {
    error.value = `Some files are not allowed and were skipped.`
    console.warn('⛔ Rejected file(s):', invalid.map(f => f.name))
  }

  files.value.push(...valid)
}

async function addFile() {
  error.value = null
  isUploading.value = true
  
  try {
    // Check if any files are selected
    if (files.value.length === 0) {
      error.value = 'Please upload at least one valid file.'
      isUploading.value = false
      return
    }

    // Check authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Authentication error: ${sessionError.message}`)
    }
    
    const authUid = sessionData?.session?.user?.id
    console.log('🔐 Supabase session UID:', authUid)
    console.log('🧠 userStore.user.id:', userStore.user?.id)

    if (!authUid) {
      throw new Error('You are not authenticated. Please log in again.')
    }

    // Check if projectId is valid
    if (!projectId) {
      throw new Error('Invalid project ID. Please check your URL.')
    }

    // Upload files one by one
    for (const file of files.value) {
      try {
        const cleanName = sanitizeFileName(file.name)
        const filePath = `${projectId}/${Date.now()}_${cleanName}`
        console.log(`📤 Uploading file: ${file.name} → ${filePath}`)

        // Upload to storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('projects-files')
          .upload(filePath, file)

        if (uploadError) {
          console.error('❌ Upload failed:', uploadError)
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        console.log('✅ Uploaded to storage:', uploadData)

        // Insert file record into database
        const { error: insertError, data: insertedFile } = await supabase
          .from('files')
          .insert({
            project_id: projectId,
            uploaded_by: authUid,
            name: file.name,
            path: filePath,
            mime_type: file.type,
            size: file.size
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ DB insert failed:', insertError)
          throw new Error(`Database insert failed: ${insertError.message}`)
        }
        emit('file-added', insertedFile)

        console.log('✅ File inserted in DB:', insertedFile)
      } catch (fileError) {
        // Log individual file errors but continue with the rest
        console.error(`Error uploading ${file.name}:`, fileError)
        error.value = `Error uploading ${file.name}: ${fileError.message}`
      }
    }

    console.log('✅ All files processed')
    files.value = []
    isUploading.value = false
    emit('close')

  } catch (err) {
    console.error('❌ Upload process failed:', err)
    error.value = err.message || 'Upload failed. Please try again.'
    isUploading.value = false
  }
}
</script>

<template>
  <div class="modal">
    <div class="wrap">
      <h1>Add File</h1>

      <ul class="fields">
        <li
          class="upload"
          @dragover="preventDefaults"
          @dragenter="preventDefaults"
          @dragleave="preventDefaults"
          @drop="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <p>Drag files here or click to browse</p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpeg,.jpg,.png,.gif,.svg,.doc,.txt,.webm"
            ref="fileInput"
            @change="handleFileInput"
            style="display: none;"
          />
        </li>
          <ul v-if="files.length">
            <li class="uploaded" v-for="(file, i) in files" :key="i">{{ file.name }}</li>
          </ul>
        <li class="actions">
          <button @click="addFile" :disabled="isUploading">
          {{ isUploading ? 'Uploading...' : 'Add File' }}
        </button>
        <button type="button" @click="emit('close')" :disabled="isUploading">Close</button>
        </li>
      </ul>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>