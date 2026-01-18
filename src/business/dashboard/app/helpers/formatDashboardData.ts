/**
 * Format time string (e.g., "14:00") to 12-hour format (e.g., "2:00 PM")
 */
export function formatTime(timeString: string): string {
	const parts = timeString.split(':')
	const hours = Number(parts[0] ?? 0)
	const minutes = parts[1] ? Number(parts[1]) : 0

	const date = new Date()
	date.setHours(hours, minutes, 0, 0)

	const hours12 = date.getHours() % 12 || 12
	const ampm = date.getHours() >= 12 ? 'PM' : 'AM'
	const mins = minutes.toString().padStart(2, '0')

	return `${hours12}:${mins} ${ampm}`
}

/**
 * Format date to relative time string (e.g., "10 minutes ago", "1 hour ago")
 */
export function formatRelativeTime(date: Date): string {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffSeconds = Math.floor(diffMs / 1000)
	const diffMinutes = Math.floor(diffSeconds / 60)
	const diffHours = Math.floor(diffMinutes / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffSeconds < 60) {
		return 'Just now'
	}

	if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
	}

	if (diffHours < 24) {
		return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
	}

	if (diffDays < 7) {
		return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
	}

	// For dates older than a week, show the actual date
	const month = date.toLocaleDateString('en-US', { month: 'short' })
	const day = date.getDate()
	return `${month} ${day}`
}
