<template>
  <header class="bg-gray-800 text-white shadow-md dark:bg-gray-900 transition-colors duration-500">
    <div class="container mx-auto flex justify-between items-center p-4">
      
      <!-- Логотип -->
      <div class="text-2xl font-bold hover:text-blue-400 transition-colors cursor-pointer">
        DropBeat
      </div>

      <!-- Навигация десктоп -->
      <nav class="hidden md:flex space-x-6 items-center">
        <RouterLink to="/" class="flex items-center space-x-1 hover:text-blue-400 transition-colors">
          <HomeIcon class="w-5 h-5"/> <span>Home</span>
        </RouterLink>
        <RouterLink to="/aboutus" class="flex items-center space-x-1 hover:text-blue-400 transition-colors">
          <InformationCircleIcon class="w-5 h-5"/> <span>About Us</span>
        </RouterLink>
        <RouterLink to="/contactus" class="flex items-center space-x-1 hover:text-blue-400 transition-colors">
          <PhoneIcon class="w-5 h-5"/> <span>Contact</span>
        </RouterLink>
      </nav>

      <!-- Кнопка логина десктоп -->
      <button class="hidden md:block bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition transform hover:-translate-y-0.5 hover:shadow-lg">
        Login
      </button>

      <!-- Бургер меню для мобилки -->
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <!-- Мобильное меню -->
    <transition name="slide-fade">
      <div v-if="mobileMenuOpen" class="md:hidden bg-gray-700 dark:bg-gray-800 text-white flex flex-col space-y-2 p-4">
        <RouterLink to="/" class="flex items-center space-x-1 hover:text-blue-400 transition-colors" @click="mobileMenuOpen = false">
          <HomeIcon class="w-5 h-5"/> <span>Home</span>
        </RouterLink>
        <RouterLink to="/aboutus" class="flex items-center space-x-1 hover:text-blue-400 transition-colors" @click="mobileMenuOpen = false">
          <InformationCircleIcon class="w-5 h-5"/> <span>About Us</span>
        </RouterLink>
        <RouterLink to="/contact" class="flex items-center space-x-1 hover:text-blue-400 transition-colors" @click="mobileMenuOpen = false">
          <PhoneIcon class="w-5 h-5"/> <span>Contact</span>
        </RouterLink>
        <button class="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition transform hover:-translate-y-0.5 hover:shadow-lg">
          Login
        </button>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

// Heroicons
import { HomeIcon, InformationCircleIcon, PhoneIcon } from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)
</script>

<style>
/* Анимация появления мобильного меню */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.1s ease-in;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-3px);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>