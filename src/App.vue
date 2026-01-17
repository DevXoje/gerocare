<script setup lang="ts">
import NotificationToast from '@/business/common/notifications/presentation/atoms/NotificationToast.vue';
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <NotificationToast />
</template>
