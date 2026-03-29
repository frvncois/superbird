import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import Lenis from 'lenis'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const lenis = new Lenis({
  autoRaf: true,
});


lenis.on('scroll', (e) => {
});

app.use(createPinia())
app.use(router)

app.mount('#app')
