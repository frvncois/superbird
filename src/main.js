import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Lenis from 'lenis'

import App from './App.vue'
import router from './router'

const lenis = new Lenis({
    autoRaf: true,
  });
  lenis.on('scroll', (e) => {
  });

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
