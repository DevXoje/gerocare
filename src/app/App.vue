<script setup lang="ts">
import { RouterView } from 'vue-router'

import NotificationToast from '@design-system/notifications/NotificationToast.vue'
</script>

<template>
	<RouterView />
	<NotificationToast />
</template>
