import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    profile: null,
    collaborators: [],
    projects: [],
    tasks: [],
    content: {},
    files: {},
    loaded: false,
    loading: false,
  }),

  actions: {
    // Original loadUser method
    async loadUser() {
      if (this.loaded || this.loading) return
      this.loading = true

      console.log('🌐 Fetching user data from Supabase (no cache)')

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session?.user) return

        this.user = session.user

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .maybeSingle()

        if (profileError?.code === 'PGRST116' || !profile) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: this.user.id,
              full_name: `${this.user.user_metadata?.first_name || ''} ${this.user.user_metadata?.last_name || ''}`.trim(),
              username: (this.user.user_metadata?.first_name || '').toLowerCase(),
              email: this.user.email,
              avatar_url: this.user.user_metadata?.avatar_url || null
            })
            .select()
            .single()

          if (insertError) throw insertError
          this.profile = newProfile
        } else {
          this.profile = profile
        }

        const { data: outgoing } = await supabase
          .from('collaborators')
          .select('collaborator_id')
          .eq('user_id', this.user.id)

        const { data: incoming } = await supabase
          .from('collaborators')
          .select('user_id')
          .eq('collaborator_id', this.user.id)

        const allIds = [...(outgoing || []).map(r => r.collaborator_id), ...(incoming || []).map(r => r.user_id)]
        const uniqueIds = [...new Set(allIds)]

        if (uniqueIds.length) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', uniqueIds)

          this.collaborators = profiles || []
        }

        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .or(`owner_id.eq.${this.user.id},collaborator_ids.cs.{${this.user.id}}`)

        this.projects = projects || []

        const projectIds = this.projects.map(p => p.id)

        // ✅ Fetch files
        if (projectIds.length) {
          const { data: filesData } = await supabase
            .from('files')
            .select('*')
            .in('project_id', projectIds)

          const groupedFiles = {}
          for (const file of filesData || []) {
            if (!groupedFiles[file.project_id]) groupedFiles[file.project_id] = []
            groupedFiles[file.project_id].push(file)
          }
          this.files = groupedFiles
        }

        // ✅ Fetch content
        if (projectIds.length) {
          const { data: contentData } = await supabase
            .from('content')
            .select('*')
            .in('project_id', projectIds)

          const groupedContent = {}
          for (const content of contentData || []) {
            if (!groupedContent[content.project_id]) groupedContent[content.project_id] = []
            groupedContent[content.project_id].push(content)
          }
          this.content = groupedContent
        }

        // ✅ Fetch tasks
        const { data: ownedTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('added_by', this.user.id)

        const { data: assignedTasks } = await supabase
          .from('tasks')
          .select('*')
          .contains('assigned_to', [this.user.id])

        this.tasks = [...(ownedTasks || []), ...(assignedTasks || [])]

        this.loaded = true

        console.groupCollapsed('✅ UserStore Loaded')
        console.log('👤 user:', this.user)
        console.log('📄 profile:', this.profile)
        console.log('👥 collaborators:', this.collaborators)
        console.log('📁 projects:', this.projects)
        console.log('📎 files:', this.files)
        console.log('🧾 content:', this.content)
        console.log('📌 tasks:', this.tasks)
        console.groupEnd()
      } catch (error) {
        console.error('❌ loadUser failed:', error)
      } finally {
        this.loading = false
      }
    },

    async deleteProject(projectId) {
      console.log('🗑️ Attempting to delete project:', projectId)
      try {
        const project = this.projects.find(p => p.id === projectId)
        if (!project) {
          console.error('❌ Project not found:', projectId)
          throw new Error('Project not found')
        }
        
        if (project.owner_id !== this.user?.id) {
          console.error('❌ Unauthorized deletion attempt')
          throw new Error('Only the project owner can delete this project')
        }

        // Delete related content first (to prevent foreign key constraints)
        if (this.content[projectId]?.length) {
          console.log('🧹 Deleting related content...')
          const contentIds = this.content[projectId].map(c => c.id)
          const { error: contentError } = await supabase
            .from('content')
            .delete()
            .in('id', contentIds)
          
          if (contentError) {
            console.error('❌ Failed to delete content:', contentError)
          }
        }

        // Delete related files
        if (this.files[projectId]?.length) {
          console.log('🧹 Deleting related files...')
          const fileIds = this.files[projectId].map(f => f.id)
          const { error: filesError } = await supabase
            .from('files')
            .delete()
            .in('id', fileIds)
          
          if (filesError) {
            console.error('❌ Failed to delete files:', filesError)
          }
        }

        // Delete related tasks
        const projectTasks = this.tasks.filter(t => t.project_id === projectId)
        if (projectTasks.length) {
          console.log('🧹 Deleting related tasks...')
          const taskIds = projectTasks.map(t => t.id)
          const { error: tasksError } = await supabase
            .from('tasks')
            .delete()
            .in('id', taskIds)
          
          if (tasksError) {
            console.error('❌ Failed to delete tasks:', tasksError)
          }
        }

        // Delete the project itself
        console.log('🗑️ Deleting project record...')
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)

        if (error) {
          console.error('❌ Failed to delete project:', error)
          throw error
        }

        // Update local state
        console.log('✅ Updating local state after project deletion')
        this.projects = this.projects.filter(p => p.id !== projectId)
        delete this.files[projectId]
        delete this.content[projectId]
        this.tasks = this.tasks.filter(t => t.project_id !== projectId)
        
        console.log(`✅ Project ${projectId} deleted successfully`)
        return { success: true }
      } catch (error) {
        console.error('❌ Project deletion failed:', error)
        throw error
      }
    },

    async createProject({ title, url, details, collaborators }) {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          owner_id: this.user.id,
          collaborator_ids: collaborators.map(c => c.id),
          title,
          url,
          details
        })
        .select()
        .single()

      if (data) this.projects.push(data)
      return { data, error }
    },

    async updateProject(projectId, updatedData) {
      const { data, error } = await supabase
        .from('projects')
        .update(updatedData)
        .eq('id', projectId)
        .select()
        .single()
    
      if (error) {
        console.error('❌ Failed to update project:', error)
        throw error
      }
    
      const index = this.projects.findIndex(p => p.id === projectId)
      if (index !== -1) {
        this.projects[index] = data
      }
    
      return data
    },    

    getFiles(projectId) {
      return this.files[projectId] || []
    },

    reset() {
      this.user = null
      this.profile = null
      this.collaborators = []
      this.projects = []
      this.tasks = []
      this.files = {}
      this.content = {}
      this.loaded = false
      localStorage.removeItem('user_cache')
      console.log('🧼 User store reset.')
    }
  }
})