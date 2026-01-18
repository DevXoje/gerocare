<script setup lang="ts" generic="T">
import { computed, nextTick,onMounted, onUnmounted, ref, watch } from 'vue'

import type { SelectOption } from '@/shared/domain/SelectOption'

defineOptions({
  name: 'AppSelect',
})

interface Props {
  modelValue: T
  options: SelectOption<T>[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar...',
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref<'top' | 'bottom'>('bottom')

const currentOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue) || props.options[0]
})

const handleSelect = (option: SelectOption<T>) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const calculateDropdownPosition = () => {
  if (!buttonRef.value) return

  const buttonRect = buttonRef.value.getBoundingClientRect()
  const dropdownHeight = dropdownRef.value?.offsetHeight || 150
  const spaceAbove = buttonRect.top
  const spaceBelow = globalThis.window.innerHeight - buttonRect.bottom

  if (spaceBelow >= dropdownHeight || spaceAbove < dropdownHeight) {
    dropdownPosition.value = 'bottom'
  } else {
    dropdownPosition.value = 'top'
  }
}

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    await nextTick()
    setTimeout(() => {
      calculateDropdownPosition()
    }, 0)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  globalThis.window.addEventListener('resize', calculateDropdownPosition)
  globalThis.window.addEventListener('scroll', calculateDropdownPosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  globalThis.window.removeEventListener('resize', calculateDropdownPosition)
  globalThis.window.removeEventListener('scroll', calculateDropdownPosition, true)
})

watch(isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    calculateDropdownPosition()
  }
})
</script>

<template>
  <div class="select">
    <button ref="buttonRef" class="select__button" @click="toggleDropdown" type="button">
      <span v-if="currentOption?.icon" class="select__icon">{{ currentOption.icon }}</span>
      <span class="select__label">{{ currentOption?.label || placeholder }}</span>
      <span class="select__arrow">{{ isOpen ? (dropdownPosition === 'top' ? '▲' : '▼') : '▼' }}</span>
    </button>

    <div v-if="isOpen" ref="dropdownRef" class="select__dropdown"
      :class="{ 'select__dropdown--top': dropdownPosition === 'top', 'select__dropdown--bottom': dropdownPosition === 'bottom' }">
      <button v-for="option in options" :key="String(option.value)" class="select__option"
        :class="{ 'select__option--active': option.value === modelValue }" @click="handleSelect(option)" type="button">
        <span v-if="option.icon" class="select__option-icon">{{ option.icon }}</span>
        <span class="select__option-label">{{ option.label }}</span>
        <span v-if="option.value === modelValue" class="select__option-check">✓</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  width: 100%;
}

.select__button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.select__button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.select__icon {
  font-size: var(--font-size-base);
}

.select__label {
  flex: 1;
  text-align: left;
  font-weight: var(--font-weight-medium);
}

.select__arrow {
  font-size: var(--font-size-xs);
  opacity: 0.6;
}

.select__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 10;
}

.select__dropdown--top {
  bottom: 100%;
  margin-bottom: var(--spacing-sm);
}

.select__dropdown--bottom {
  top: 100%;
  margin-top: var(--spacing-sm);
}

.select__option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-base);
  text-align: left;
}

.select__option:hover {
  background-color: var(--color-bg-hover);
}

.select__option--active {
  background-color: var(--color-bg-active);
  color: var(--token-color-info-600);
}

.select__option-icon {
  font-size: var(--font-size-base);
  width: 1.5rem;
  text-align: center;
}

.select__option-label {
  flex: 1;
  font-weight: var(--font-weight-medium);
}

.select__option-check {
  color: var(--token-color-info-600);
  font-weight: var(--font-weight-bold);
}
</style>
