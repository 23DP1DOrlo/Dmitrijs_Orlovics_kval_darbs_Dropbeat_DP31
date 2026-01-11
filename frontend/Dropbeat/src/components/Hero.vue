<template>
    <section class="relative bg-gradient-to-r from-blue-700 to-gray-600  text-white h-screen flex items-center justify-center">
      <!-- Фоновый слой с эффектом -->
      <div class="absolute inset-0 bg-black opacity-30"></div>
  
      <!-- Контент -->
      <div class="relative z-10 text-center px-6 md:px-12">
        <h1 class="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          Welcome to DropBeat
        </h1>
        <p class="text-lg md:text-2xl mb-6 animate-fade-in ">
          Your ultimate music experience starts here.
        </p>
        <div class="flex justify-center gap-4 animate-fade-in">
          <button class="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg transform transition hover:scale-105">
            Get Started
          </button>
          <button class="bg-white text-blue-600 hover:text-blue-800 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold shadow-lg transform transition hover:scale-105">
            Learn More
          </button>
        </div>
      </div>
  
      <!-- Декоративные элементы -->
      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  // тут пока ничего не нужно, чисто визуальный компонент
  </script>
  
  <style scoped>
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 1s forwards;
  }
  .animate-bounce { animation: bounce 2s infinite; }
  </style>