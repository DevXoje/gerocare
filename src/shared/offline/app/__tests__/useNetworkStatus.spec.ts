import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import { useNetworkStatus } from '@/shared/offline/app/useNetworkStatus'

// Helper component to test composable with Vue context
const TestComponent = defineComponent({
	setup() {
		return useNetworkStatus()
	},
	template: '<div></div>',
})

describe('useNetworkStatus', () => {
	beforeEach(() => {
		// Reset navigator.onLine
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		})
	})

	it('should initialize with current navigator.onLine status', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		})

		const wrapper = mount(TestComponent)
		const vm = wrapper.vm as ReturnType<typeof useNetworkStatus>

		expect(vm.isOnline.value).toBe(true)
		wrapper.unmount()
	})

	it('should initialize as offline when navigator.onLine is false', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: false,
		})

		const wrapper = mount(TestComponent)
		const vm = wrapper.vm as ReturnType<typeof useNetworkStatus>

		expect(vm.isOnline.value).toBe(false)
		wrapper.unmount()
	})

	it('should expose wasOffline reactive ref', () => {
		const wrapper = mount(TestComponent)
		const vm = wrapper.vm as ReturnType<typeof useNetworkStatus>

		expect(vm.wasOffline.value).toBe(false)
		expect(typeof vm.wasOffline.value).toBe('boolean')
		wrapper.unmount()
	})

	it('should expose isOnline reactive ref', () => {
		const wrapper = mount(TestComponent)
		const vm = wrapper.vm as ReturnType<typeof useNetworkStatus>

		expect(typeof vm.isOnline.value).toBe('boolean')
		wrapper.unmount()
	})

	it('should clean up on unmount', () => {
		const wrapper = mount(TestComponent)

		// Should not throw on unmount
		expect(() => wrapper.unmount()).not.toThrow()
	})
})
