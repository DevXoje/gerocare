<script setup lang="ts">
import { nextTick,ref, watch } from 'vue'

import ResidentForm from './ResidentForm.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const dialogRef = ref<HTMLDialogElement | null>(null)

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'close': []
  'success': []
}>()

const handleClose = () => {
  // Only update the prop, let the watch handle the actual dialog closing
  emit('update:isOpen', false)
  emit('close')
}

const handleSuccess = () => {
  // Only update the prop, let the watch handle the actual dialog closing
  emit('update:isOpen', false)
  emit('success')
}

const handleBackdropClick = (event: MouseEvent) => {
  // Close dialog when clicking on the backdrop
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

watch(() => props.isOpen, async (isOpen) => {
  await nextTick()
  if (!dialogRef.value) return

  if (isOpen) {
    dialogRef.value.showModal()
  } else if (dialogRef.value.open) {
    // Only close if the dialog is still open
    dialogRef.value.close()
  }
})

// Handle dialog close event (from Escape key or backdrop click)
const handleDialogClose = () => {
  // Only update state if the dialog was actually open
  if (props.isOpen) {
    emit('update:isOpen', false)
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <dialog v-if="isOpen" ref="dialogRef" class="modal-dialog" @click="handleBackdropClick"
        @close="handleDialogClose">
        <div class="modal-container">
          <div class="modal-content">
            <ResidentForm @success="handleSuccess" @cancel="handleClose" />
          </div>
        </div>
      </dialog>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-dialog {
  border: none;
  background: transparent;
  padding: 0;
  margin: auto;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.modal-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1rem;
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-dialog {
    max-width: 100%;
    max-height: 95vh;
    top: auto;
    bottom: 0;
    left: 0;
    transform: translateY(0);
    margin: 0;
  }

  .modal-container {
    padding: 0;
    max-height: 95vh;
  }

  .modal-content {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>
