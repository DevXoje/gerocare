<script setup lang="ts" generic="T">
import { computed } from 'vue'

defineOptions({
  name: 'AppTable',
})

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

interface Props<T> {
  columns: Column[]
  data: T[]
  sortable?: boolean
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  striped?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props<T>>(), {
  sortable: false,
  sortKey: undefined,
  sortOrder: 'asc',
  striped: false,
  hoverable: true,
})

const emit = defineEmits<{
  'sort': [key: string, order: 'asc' | 'desc']
  'row-click': [row: T]
}>()

const tableClasses = computed(() => ({
  'table': true,
  'table--striped': props.striped,
  'table--hoverable': props.hoverable,
}))

const handleSort = (column: Column) => {
  if (props.sortable && column.sortable !== false) {
    const newOrder =
      props.sortKey === column.key && props.sortOrder === 'asc' ? 'desc' : 'asc'
    emit('sort', column.key, newOrder)
  }
}

const handleRowClick = (row: T) => {
  emit('row-click', row)
}

const getCellValue = (row: T, key: string): unknown => {
  const keys = key.split('.')
  let value: any = row
  for (const k of keys) {
    value = value?.[k]
  }
  return value ?? ''
}

const getSortIcon = (column: Column): string => {
  if (!props.sortable || column.sortable === false) return ''
  if (props.sortKey !== column.key) return '⇅'
  return props.sortOrder === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="table-wrapper">
    <table :class="tableClasses">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
            :class="{
              'table__header--sortable': sortable && column.sortable !== false,
            }"
            @click="handleSort(column)"
          >
            {{ column.label }}
            <span v-if="getSortIcon(column)" class="table__sort-icon">{{
              getSortIcon(column)
            }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index" @click="handleRowClick(row)">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="getCellValue(row, column.key)">
              {{ getCellValue(row, column.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-bg-primary);
}

.table__header--sortable {
  cursor: pointer;
  user-select: none;
}

.table__header--sortable:hover {
  background-color: var(--color-bg-hover);
}

.table__sort-icon {
  margin-left: var(--spacing-xs);
  font-size: var(--font-size-xs);
  opacity: 0.6;
}

thead {
  background-color: var(--color-bg-secondary);
}

th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-border-default);
}

td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-default);
}

tbody tr {
  transition: background-color var(--transition-base);
}

.table--striped tbody tr:nth-child(even) {
  background-color: var(--color-bg-secondary);
}

.table--hoverable tbody tr:hover {
  background-color: var(--color-bg-hover);
  cursor: pointer;
}
</style>
