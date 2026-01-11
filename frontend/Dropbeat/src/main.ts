import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import 'aos/dist/aos.css'   

// @ts-ignore
import AOS from 'aos'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

AOS.init({ duration: 2200, once: false })