<template>
  <Header />
  <Hero />
  <router-view />
  <Footer />
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Hero from './components/Hero.vue';
import Footer from './components/Footer.vue'
</script>