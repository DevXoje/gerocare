<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
	name: 'AppFileUpload',
})

interface Props {
	accept?: string
	disabled?: boolean
	required?: boolean
	error?: string | boolean
	multiple?: boolean
	maxSize?: number
	id?: string
	name?: string
	preview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	accept: undefined,
	disabled: false,
	required: false,
	error: false,
	multiple: false,
	maxSize: 5242880,
	id: undefined,
	name: undefined,
	preview: true,
})

const emit = defineEmits<{
	'update:modelValue': [files: FileList | null]
	change: [files: FileList | null]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrls = ref<string[]>([])
const selectedFiles = ref<File[]>([])

const hasError = computed(() => {
	return props.error === true || (typeof props.error === 'string' && props.error.length > 0)
})

const uploadClasses = computed(() => ({
	'file-upload': true,
	'file-upload--error': hasError.value,
	'file-upload--disabled': props.disabled,
}))

const handleFileSelect = (event: Event) => {
	const target = event.target as HTMLInputElement
	const files = target.files

	if (!files || files.length === 0) {
		emit('update:modelValue', null)
		emit('change', null)
		return
	}

	selectedFiles.value = Array.from(files)

	if (props.preview) {
		previewUrls.value = []
		Array.from(files).forEach(file => {
			if (file.type.startsWith('image/')) {
				const url = URL.createObjectURL(file)
				previewUrls.value.push(url)
			}
		})
	}

	emit('update:modelValue', files)
	emit('change', files)
}

const removeFile = (index: number) => {
	if (props.disabled) return

	selectedFiles.value.splice(index, 1)
	if (previewUrls.value[index]) {
		URL.revokeObjectURL(previewUrls.value[index])
		previewUrls.value.splice(index, 1)
	}

	const dt = new DataTransfer()
	selectedFiles.value.forEach(file => dt.items.add(file))

	if (fileInputRef.value) {
		fileInputRef.value.files = dt.files
		emit('update:modelValue', dt.files)
		emit('change', dt.files)
	}
}

const triggerFileInput = () => {
	if (!props.disabled && fileInputRef.value) {
		fileInputRef.value.click()
	}
}
</script>

<template>
	<div :class="uploadClasses">
		<input
			ref="fileInputRef"
			:id="id"
			:name="name"
			type="file"
			:accept="accept"
			:disabled="disabled"
			:required="required"
			:multiple="multiple"
			class="file-upload__input"
			@change="handleFileSelect"
		/>
		<div class="file-upload__dropzone" @click="triggerFileInput">
			<div class="file-upload__content">
				<span class="file-upload__icon">📎</span>
				<span class="file-upload__text">Haz clic o arrastra archivos aquí</span>
				<span v-if="accept" class="file-upload__hint">Tipos permitidos: {{ accept }}</span>
			</div>
		</div>
		<div v-if="preview && previewUrls.length > 0" class="file-upload__preview">
			<div v-for="(url, index) in previewUrls" :key="index" class="file-upload__preview-item">
				<img :src="url" :alt="`Preview ${index + 1}`" class="file-upload__preview-image" />
				<button
					type="button"
					class="file-upload__remove"
					:disabled="disabled"
					@click.stop="removeFile(index)"
				>
					×
				</button>
			</div>
		</div>
		<div v-if="selectedFiles.length > 0 && !preview" class="file-upload__list">
			<div v-for="(file, index) in selectedFiles" :key="index" class="file-upload__list-item">
				<span class="file-upload__filename">{{ file.name }}</span>
				<button
					type="button"
					class="file-upload__remove"
					:disabled="disabled"
					@click="removeFile(index)"
				>
					×
				</button>
			</div>
		</div>
		<p v-if="hasError" class="file-upload__error">
			{{ typeof error === 'string' ? error : 'Error al seleccionar archivo' }}
		</p>
	</div>
</template>

<style scoped>
.file-upload {
	width: 100%;
}

.file-upload__input {
	display: none;
}

.file-upload__dropzone {
	width: 100%;
	padding: var(--spacing-xl);
	border: 2px dashed var(--color-border-default);
	border-radius: var(--radius-md);
	background-color: var(--color-bg-secondary);
	text-align: center;
	cursor: pointer;
	transition: all var(--transition-base);
}

.file-upload__dropzone:hover:not(.file-upload--disabled) {
	border-color: var(--color-border-hover);
	background-color: var(--color-bg-hover);
}

.file-upload--error .file-upload__dropzone {
	border-color: var(--color-border-error);
}

.file-upload--disabled .file-upload__dropzone {
	cursor: not-allowed;
	opacity: 0.6;
}

.file-upload__content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-sm);
}

.file-upload__icon {
	font-size: var(--font-size-2xl);
}

.file-upload__text {
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
}

.file-upload__hint {
	color: var(--color-text-secondary);
	font-size: var(--font-size-xs);
}

.file-upload__preview {
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-md);
	margin-top: var(--spacing-md);
}

.file-upload__preview-item {
	position: relative;
	width: 100px;
	height: 100px;
	border-radius: var(--radius-md);
	overflow: hidden;
	border: 1px solid var(--color-border-default);
}

.file-upload__preview-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.file-upload__list {
	margin-top: var(--spacing-md);
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
}

.file-upload__list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--spacing-sm) var(--spacing-md);
	background-color: var(--color-bg-secondary);
	border-radius: var(--radius-md);
	border: 1px solid var(--color-border-default);
}

.file-upload__filename {
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-upload__remove {
	background: none;
	border: none;
	color: var(--color-border-error);
	font-size: var(--font-size-xl);
	cursor: pointer;
	padding: 0 var(--spacing-xs);
	line-height: 1;
	transition: opacity var(--transition-base);
}

.file-upload__remove:hover:not(:disabled) {
	opacity: 0.7;
}

.file-upload__remove:disabled {
	cursor: not-allowed;
	opacity: 0.4;
}

.file-upload__error {
	margin: var(--spacing-xs) 0 0 0;
	font-size: var(--font-size-xs);
	color: var(--color-border-error);
}
</style>
