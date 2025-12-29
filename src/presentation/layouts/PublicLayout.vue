<script setup lang="ts">
</script>

<template>
  <div class="public-layout">
    <main class="public-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  width: 100%;
}

.public-content {
  width: 100%;
  min-height: 100vh;
}
</style>

