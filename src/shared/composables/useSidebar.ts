import { computed, onMounted, onUnmounted, ref } from 'vue'

// Estado compartido global para el sidebar
const isOpen = ref(false)
const isMobile = ref(false)

const MOBILE_BREAKPOINT = 768

function checkMobile() {
	isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
	if (!isMobile.value) {
		isOpen.value = true
	} else {
		isOpen.value = false
	}
}

export function useSidebar() {
	const toggle = () => {
		isOpen.value = !isOpen.value
	}

	const close = () => {
		if (isMobile.value) {
			isOpen.value = false
		}
	}

	const open = () => {
		isOpen.value = true
	}

	// Inicializar estado al montar
	if (typeof window !== 'undefined') {
		checkMobile()
	}

	onMounted(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', checkMobile)
	})

	return {
		isOpen: computed(() => isOpen.value),
		isMobile: computed(() => isMobile.value),
		toggle,
		close,
		open,
	}
}
