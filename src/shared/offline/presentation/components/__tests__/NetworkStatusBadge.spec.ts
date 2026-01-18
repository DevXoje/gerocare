import { beforeEach, describe, expect, it, vi } from 'vitest'

import NetworkStatusBadge from '@/shared/offline/presentation/components/NetworkStatusBadge.vue'
import { renderComponent } from '@/test/helpers/render'

describe('NetworkStatusBadge', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		})
	})

	it('should render badge when offline', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: false,
		})

		const wrapper = renderComponent(NetworkStatusBadge, {})

		expect(wrapper.text()).toContain('Sin conexión')
	})

	it('should not render badge when online', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		})

		const wrapper = renderComponent(NetworkStatusBadge, {})

		expect(wrapper.text()).toBe('')
	})

	it('should show label when showLabel prop is true', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: false,
		})

		const wrapper = renderComponent(NetworkStatusBadge, {
			props: { showLabel: true },
		})

		expect(wrapper.text()).toContain('Sin conexión')
	})

	it('should use inline position by default', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: false,
		})

		const wrapper = renderComponent(NetworkStatusBadge, {})

		const badge = wrapper.find('.network-status-badge')
		expect(badge.exists()).toBe(true)
		expect(badge.classes()).not.toContain('network-status-badge--fixed')
	})

	it('should use fixed position when position prop is fixed', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: false,
		})

		const wrapper = renderComponent(NetworkStatusBadge, {
			props: { position: 'fixed' },
		})

		const badge = wrapper.find('.network-status-badge')
		expect(badge.classes()).toContain('network-status-badge--fixed')
	})
})
