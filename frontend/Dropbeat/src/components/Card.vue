<template>
    <div class="flex flex-wrap justify-center gap-6">
      <div
        class="bg-white shadow-md rounded-lg p-6 transform transition-all duration-300
               hover:-translate-y-1 hover:shadow-xl
                flex-col items-center text-center
               inline-block min-w-[200px] max-w-[300px]"
      >
        <h3 class="text-xl font-bold mb-2">{{ title }}</h3>
        <img :src="image" alt="Card image" class="w-24 h-24 object-cover mb-2 rounded-md mx-auto" />
        <p class="text-gray-700">{{ text }}</p>
        <button
          class="mt-4 bg-blue-500 text-white px-4 py-2 rounded transform transition-all duration-700
                 hover:bg-blue-600 hover:-translate-y-1.5 hover:shadow-xl"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    title: string
    text: string
    buttonText: string
    image: string
  }>()
  </script>