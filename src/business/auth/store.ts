import { defineStore } from "pinia"
import { ref } from "vue"
import type { User } from "./domain/User"

interface AuthState {
  user: User | null
}

const initialState: AuthState = {
  user: null,
}

export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState>(initialState)

  return {
    state,
  }
})
