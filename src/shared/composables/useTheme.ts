import { ThemeMode, THEME_STORAGE_KEY, isThemeMode } from '@/shared/domain/Theme'
import { ref, computed, watch, onMounted } from 'vue'


// Estado global compartido
const themeMode = ref<ThemeMode>(ThemeMode.Auto)
const isDark = ref(false)

let systemThemeListener: MediaQueryList | null = null

function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement

  if (mode === ThemeMode.Auto) {
    const prefersDark = getSystemPreference()
    isDark.value = prefersDark
    root.classList.remove('light', 'dark')
    root.classList.toggle('dark', prefersDark)
  } else {
    isDark.value = mode === ThemeMode.Dark
    root.classList.remove('light', 'dark')
    if (mode === ThemeMode.Dark) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  }
}

function setupSystemThemeListener() {
  if (typeof window === 'undefined') return

  // Remover listener anterior si existe
  if (systemThemeListener) {
    systemThemeListener.removeEventListener('change', handleSystemThemeChange)
  }

  // Solo escuchar si estamos en modo auto
  if (themeMode.value === ThemeMode.Auto) {
    systemThemeListener = globalThis.matchMedia('(prefers-color-scheme: dark)')
    systemThemeListener.addEventListener('change', handleSystemThemeChange)
  }
}

function handleSystemThemeChange(e: MediaQueryListEvent) {
  if (themeMode.value === ThemeMode.Auto) {
    isDark.value = e.matches
    applyTheme(ThemeMode.Auto)
  }
}

function loadSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return ThemeMode.Auto

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    return isThemeMode(saved) ? saved : ThemeMode.Auto
  } catch (error) {
    console.warn('Error loading theme from localStorage:', error)
  }

  return ThemeMode.Auto
}

function saveTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch (error) {
    console.warn('Error saving theme to localStorage:', error)
  }
}

// Inicializar tema al cargar el módulo (para evitar FOUC)
if (typeof window !== 'undefined') {
  const savedTheme = loadSavedTheme()
  themeMode.value = savedTheme
  applyTheme(savedTheme)
}

export function useTheme() {
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    applyTheme(mode)
    saveTheme(mode)
    setupSystemThemeListener()
  }

  const toggleTheme = () => {
    if (themeMode.value === ThemeMode.Auto) {
      // Si está en auto, cambiar a light o dark según preferencia actual
      setTheme(isDark.value ? ThemeMode.Light : ThemeMode.Dark)
    } else {
      // Alternar entre ThemeMode.Light y ThemeMode.Dark
      setTheme(themeMode.value === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark)
    }
  }

  // Configurar listener cuando el componente se monta
  onMounted(() => {
    // Asegurar que el tema esté aplicado
    applyTheme(themeMode.value)
    setupSystemThemeListener()
  })

  // Watch para actualizar listener cuando cambia el modo
  watch(themeMode, () => {
    setupSystemThemeListener()
  })

  return {
    themeMode: computed(() => themeMode.value),
    isDark: computed(() => isDark.value),
    setTheme,
    toggleTheme,
  }
}
