<template>
  <div class="p-10 text-center">
    <h1 class="text-4xl font-bold">Welcome to DropBeat</h1>
  </div>
  <div class="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols3 gap-5">
    <Card 
      title="Title1"
      text="abcbc"
      buttonText="Discover"
      image="/images/testimage.jpg"
      data-aos="fade-right"
      />
    <Card
      title="Title1"
      text="abcbc"
      buttonText="Discover"
      image="/images/testimage.jpg"
      data-aos="fade-center"
      />
    <Card
      title="Title1"
      text="abcbc"
      buttonText="Discover"
      image="/images/testimage.jpg"
      data-aos="fade-left"
      />
  </div>
</template>
<script setup lang="ts">
  import Card from '@/components/Card.vue'
  </script>