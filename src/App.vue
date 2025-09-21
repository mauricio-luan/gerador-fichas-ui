<template>
  <v-app>
    <ToolBar />
    <router-view />
    <AppFooter />
  </v-app>
</template>

<script setup>
import AppFooter from './components/AppFooter.vue';
import ToolBar from './components/ToolBar.vue';
</script>
