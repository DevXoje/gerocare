<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

import IconButton from '@/business/common/presentation/atoms/IconButton.vue'

defineOptions({
	name: 'AppModal',
})

interface Props {
	modelValue: boolean
	title?: string
	closeOnOverlay?: boolean
	closeOnEscape?: boolean
	size?: 'sm' | 'md' | 'lg' | 'xl'
	showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	title: undefined,
	closeOnOverlay: true,
	closeOnEscape: true,
	size: 'md',
	showClose: true,
})

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	close: []
}>()

const handleClose = () => {
	emit('update:modelValue', false)
	emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
	if (props.closeOnOverlay && (event.target as HTMLElement).classList.contains('modal__overlay')) {
		handleClose()
	}
}

const handleEscape = (event: KeyboardEvent) => {
	if (props.closeOnEscape && event.key === 'Escape' && props.modelValue) {
		handleClose()
	}
}

watch(
	() => props.modelValue,
	isOpen => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
	}
)

onMounted(() => {
	document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
	document.removeEventListener('keydown', handleEscape)
	document.body.style.overflow = ''
})
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="modelValue" class="modal__overlay" @click="handleOverlayClick">
				<div :class="['modal', `modal--${size}`]" @click.stop>
					<div v-if="title || showClose" class="modal__header">
						<h2 v-if="title" class="modal__title">{{ title }}</h2>
						<IconButton
							v-if="showClose"
							icon="×"
							variant="ghost"
							size="sm"
							aria-label="Cerrar"
							@click="handleClose"
						/>
					</div>
					<div class="modal__body">
						<slot />
					</div>
					<div v-if="$slots.footer" class="modal__footer">
						<slot name="footer" />
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal__overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: var(--spacing-lg);
}

.modal {
	background-color: var(--color-bg-primary);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-xl);
	max-width: 100%;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.modal--sm {
	width: 100%;
	max-width: 400px;
}

.modal--md {
	width: 100%;
	max-width: 600px;
}

.modal--lg {
	width: 100%;
	max-width: 800px;
}

.modal--xl {
	width: 100%;
	max-width: 1200px;
}

.modal__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--spacing-xl);
	border-bottom: 1px solid var(--color-border-default);
}

.modal__title {
	margin: 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.modal__body {
	padding: var(--spacing-xl);
	overflow-y: auto;
	flex: 1;
}

.modal__footer {
	padding: var(--spacing-xl);
	border-top: 1px solid var(--color-border-default);
	display: flex;
	justify-content: flex-end;
	gap: var(--spacing-md);
}

.modal-enter-active,
.modal-leave-active {
	transition: opacity var(--transition-slow);
}

.modal-enter-active .modal,
.modal-leave-active .modal {
	transition:
		transform var(--transition-slow),
		opacity var(--transition-slow);
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
	transform: scale(0.95);
	opacity: 0;
}
</style>
