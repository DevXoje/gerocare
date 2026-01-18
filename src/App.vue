<script setup lang="ts">
import { RouterView } from 'vue-router'

import NotificationToast from '@/business/common/notifications/presentation/atoms/NotificationToast.vue';
</script>

<template>
  <RouterView />
  <NotificationToast />
</template>
