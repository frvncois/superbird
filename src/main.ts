import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import { createLenis } from '@/composables/useLenis'

import App from './App.vue'
import router from './router'

const app = createApp(App)

createLenis()

app.use(createPinia())
app.use(router)

app.mount('#app')
