<script setup lang="ts">
import { computed } from 'vue'

import IconButton from '@/business/common/presentation/atoms/IconButton.vue'

defineOptions({
	name: 'AppPagination',
})

interface Props {
	currentPage: number
	totalPages: number
	totalItems?: number
	itemsPerPage?: number
	showInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	totalItems: undefined,
	itemsPerPage: undefined,
	showInfo: false,
})

const emit = defineEmits<{
	'update:currentPage': [page: number]
	'page-change': [page: number]
}>()

const currentPageValue = computed({
	get: () => props.currentPage,
	set: value => {
		emit('update:currentPage', value)
		emit('page-change', value)
	},
})

const pages = computed(() => {
	const pageNumbers: (number | string)[] = []
	const total = props.totalPages

	if (total <= 7) {
		for (let i = 1; i <= total; i++) {
			pageNumbers.push(i)
		}
	} else {
		if (currentPageValue.value <= 3) {
			for (let i = 1; i <= 5; i++) {
				pageNumbers.push(i)
			}
			pageNumbers.push('...')
			pageNumbers.push(total)
		} else if (currentPageValue.value >= total - 2) {
			pageNumbers.push(1)
			pageNumbers.push('...')
			for (let i = total - 4; i <= total; i++) {
				pageNumbers.push(i)
			}
		} else {
			pageNumbers.push(1)
			pageNumbers.push('...')
			for (let i = currentPageValue.value - 1; i <= currentPageValue.value + 1; i++) {
				pageNumbers.push(i)
			}
			pageNumbers.push('...')
			pageNumbers.push(total)
		}
	}

	return pageNumbers
})

const infoText = computed(() => {
	if (!props.showInfo || !props.totalItems || !props.itemsPerPage) return ''
	const start = (props.currentPage - 1) * props.itemsPerPage + 1
	const end = Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
	return `${start}-${end} de ${props.totalItems}`
})

const goToPage = (page: number) => {
	if (page >= 1 && page <= props.totalPages && page !== currentPageValue.value) {
		currentPageValue.value = page
	}
}

const goToPrevious = () => {
	if (currentPageValue.value > 1) {
		goToPage(currentPageValue.value - 1)
	}
}

const goToNext = () => {
	if (currentPageValue.value < props.totalPages) {
		goToPage(currentPageValue.value + 1)
	}
}
</script>

<template>
	<div class="pagination">
		<div v-if="showInfo && infoText" class="pagination__info">{{ infoText }}</div>
		<div class="pagination__controls">
			<IconButton
				icon="←"
				variant="outline"
				size="sm"
				:disabled="currentPage === 1"
				aria-label="Página anterior"
				@click="goToPrevious"
			/>
			<div class="pagination__pages">
				<button
					v-for="(page, index) in pages"
					:key="index"
					type="button"
					:class="{
						pagination__page: true,
						'pagination__page--active': page === currentPage,
						'pagination__page--ellipsis': page === '...',
					}"
					:disabled="page === '...' || page === currentPage"
					@click="typeof page === 'number' ? goToPage(page) : undefined"
				>
					{{ page }}
				</button>
			</div>
			<IconButton
				icon="→"
				variant="outline"
				size="sm"
				:disabled="currentPage === totalPages"
				aria-label="Página siguiente"
				@click="goToNext"
			/>
		</div>
	</div>
</template>

<style scoped>
.pagination {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-lg);
	flex-wrap: wrap;
}

.pagination__info {
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}

.pagination__controls {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.pagination__pages {
	display: flex;
	gap: var(--spacing-xs);
}

.pagination__page {
	min-width: 36px;
	height: 36px;
	padding: 0 var(--spacing-sm);
	background: var(--color-bg-primary);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	color: var(--color-text-primary);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--transition-base);
}

.pagination__page:hover:not(:disabled) {
	background: var(--color-bg-hover);
	border-color: var(--color-border-hover);
}

.pagination__page--active {
	background: var(--token-color-primary-600);
	color: var(--vt-c-white);
	border-color: var(--token-color-primary-600);
}

.pagination__page--active:hover:not(:disabled) {
	background: var(--token-color-primary-700);
	border-color: var(--token-color-primary-700);
}

.pagination__page--ellipsis {
	border: none;
	background: none;
	cursor: default;
	pointer-events: none;
}

.pagination__page:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>
