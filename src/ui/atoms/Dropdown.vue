<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

defineOptions({
	name: 'AppDropdown',
})

interface DropdownItem {
	label: string
	value: string | number
	icon?: string
	disabled?: boolean
	divider?: boolean
}

interface Props {
	items: DropdownItem[]
	trigger?: 'click' | 'hover'
	placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

const props = withDefaults(defineProps<Props>(), {
	trigger: 'click',
	placement: 'bottom-left',
})

const emit = defineEmits<{
	select: [item: DropdownItem]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const dropdownClasses = computed(() => ({
	dropdown: true,
	'dropdown--open': isOpen.value,
	[`dropdown--${props.placement}`]: true,
}))

const toggle = () => {
	isOpen.value = !isOpen.value
}

const close = () => {
	isOpen.value = false
}

const handleSelect = (item: DropdownItem) => {
	if (!item.disabled && !item.divider) {
		emit('select', item)
		close()
	}
}

const handleClickOutside = (event: MouseEvent) => {
	if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
		close()
	}
}

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Escape' && isOpen.value) {
		close()
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
	document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
	document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
	<div ref="dropdownRef" :class="dropdownClasses">
		<div
			class="dropdown__trigger"
			@click="trigger === 'click' ? toggle() : undefined"
			@mouseenter="trigger === 'hover' ? (isOpen = true) : undefined"
			@mouseleave="trigger === 'hover' ? (isOpen = false) : undefined"
		>
			<slot name="trigger" :is-open="isOpen" :toggle="toggle" />
		</div>
		<Transition name="dropdown">
			<div
				v-if="isOpen"
				class="dropdown__menu"
				@mouseleave="trigger === 'hover' ? close() : undefined"
			>
				<button
					v-for="(item, index) in items"
					:key="index"
					:class="{
						dropdown__item: true,
						'dropdown__item--disabled': item.disabled,
						'dropdown__item--divider': item.divider,
					}"
					:disabled="item.disabled || item.divider"
					@click="handleSelect(item)"
				>
					<span v-if="item.icon" class="dropdown__item-icon">{{ item.icon }}</span>
					<span class="dropdown__item-label">{{ item.label }}</span>
				</button>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.dropdown {
	position: relative;
	display: inline-block;
}

.dropdown__trigger {
	cursor: pointer;
}

.dropdown__menu {
	position: absolute;
	z-index: 1000;
	min-width: 200px;
	background-color: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	overflow: hidden;
	margin-top: var(--spacing-xs);
}

.dropdown--bottom-left .dropdown__menu {
	top: 100%;
	left: 0;
}

.dropdown--bottom-right .dropdown__menu {
	top: 100%;
	right: 0;
}

.dropdown--top-left .dropdown__menu {
	bottom: 100%;
	left: 0;
	margin-top: 0;
	margin-bottom: var(--spacing-xs);
}

.dropdown--top-right .dropdown__menu {
	bottom: 100%;
	right: 0;
	margin-top: 0;
	margin-bottom: var(--spacing-xs);
}

.dropdown__item {
	width: 100%;
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	padding: var(--spacing-md);
	background: none;
	border: none;
	text-align: left;
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: background-color var(--transition-base);
}

.dropdown__item:hover:not(:disabled) {
	background-color: var(--color-bg-hover);
}

.dropdown__item--disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.dropdown__item--divider {
	padding: 0;
	height: 1px;
	background-color: var(--color-border-default);
	cursor: default;
}

.dropdown__item-icon {
	font-size: var(--font-size-base);
	width: 20px;
	text-align: center;
}

.dropdown__item-label {
	flex: 1;
}

.dropdown-enter-active,
.dropdown-leave-active {
	transition:
		opacity var(--transition-base),
		transform var(--transition-base);
}

.dropdown-enter-from,
.dropdown-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
