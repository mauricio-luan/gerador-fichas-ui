<template>
  <v-toolbar density="default" color="#FFFFFF">
    <v-toolbar-title class="poppins-bold" style="color: gray"
      >Gerador de Fichas</v-toolbar-title
    >
    <v-btn icon class="mx-5">
      <img :src="payer" alt="payer" style="width: 150px; margin-right: 100px" />
    </v-btn>
  </v-toolbar>
</template>

<script setup>
import payer from '../assets/payer.svg';
</script>
