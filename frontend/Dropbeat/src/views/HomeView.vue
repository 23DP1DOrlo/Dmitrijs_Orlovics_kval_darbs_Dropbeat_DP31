<template>
  <div class="p-10 text-center">
    <h1 class="text-4xl font-bold">Welcome to DropBeat</h1>
  </div>
  <div class="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols3 gap-5">
  
    <!-- <Card 
      title="Title1"
      text="abcbc"
      buttonText="Discover"
      image="/images/testimage.jpg"
      data-aos="fade-right"
      />
    <Card
      title="Title1"
      text="abcbc"
      buttonText="Discover1"
      image="/images/testimage.jpg"
      data-aos="fade-center"
      />
    <Card
      title="Title1"
      text="abcbc"
      buttonText="Discover"
      image="/images/testimage.jpg"
      data-aos="fade-left"
      /> -->
      <Card
      v-for="(card, index) in cards"
      :key="index"
      :title="card.title"
      :text="card.text"
      :buttonText="card.buttonText"
      :image="card.image"
      :data-aos="card.dataAos"
    />
  </div>
</template>
<script setup lang="ts">
  import Card from '@/components/Card.vue'
  const cards = [
    {
      text: "abcbc",
      title:"Title1",
      buttonText: "Discover",
      image: "/images/testimage.jpg",
      dataAos: "fade-right"
    },
    {
      text: "Title1",
      title:"Title1",
      buttonText: "abcbc",
      image: "/images/testimage.jpg",
      dataAos: "fade-center"
    },
    {
      text: "Title1",
      title:"Title1",
      buttonText: "abcbc",
      image: "/images/testimage.jpg",
      dataAos: "fade-left"
    },
  ]
  </script>