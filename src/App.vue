<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationToast from '@/presentation/components/atoms/NotificationToast.vue'
</script>

<template>
  <RouterView />
  <NotificationToast />
</template>
