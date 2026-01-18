<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'AppBreadcrumb',
})

interface BreadcrumbItem {
  label: string
  to?: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: BreadcrumbItem, index: number]
}>()

const handleClick = (item: BreadcrumbItem, index: number) => {
  emit('item-click', item, index)
}
</script>

<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb__list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb__item">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="breadcrumb__link"
          @click="handleClick(item, index)"
        >
          {{ item.label }}
        </RouterLink>
        <a
          v-else-if="item.href"
          :href="item.href"
          class="breadcrumb__link"
          @click="handleClick(item, index)"
        >
          {{ item.label }}
        </a>
        <span v-else class="breadcrumb__current" aria-current="page">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb__separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  width: 100%;
}

.breadcrumb__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb__link {
  color: var(--color-text-link);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);
}

.breadcrumb__link:hover {
  color: var(--color-text-link-hover);
  text-decoration: underline;
}

.breadcrumb__current {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.breadcrumb__separator {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 var(--spacing-xs);
}
</style>
