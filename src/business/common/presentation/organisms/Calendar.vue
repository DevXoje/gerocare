<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from '@/business/common/presentation/atoms/Button.vue'
import IconButton from '@/business/common/presentation/atoms/IconButton.vue'

defineOptions({
	name: 'AppCalendar',
})

export interface CalendarEvent {
	id: string
	date: Date
	title: string
	color?: string
	data?: unknown
}

interface Props {
	modelValue?: Date
	events?: CalendarEvent[]
	selectable?: boolean
	minDate?: Date
	maxDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: undefined,
	events: () => [],
	selectable: true,
	minDate: undefined,
	maxDate: undefined,
})

const emit = defineEmits<{
	'update:modelValue': [date: Date]
	'date-select': [date: Date]
	'event-click': [event: CalendarEvent]
}>()

const currentDate = ref(props.modelValue ? new Date(props.modelValue) : new Date())
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthNames = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
]

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const daysInMonth = computed(() => {
	return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
	return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarDays = computed(() => {
	const days: (Date | null)[] = []

	for (let i = 0; i < firstDayOfMonth.value; i++) {
		days.push(null)
	}

	for (let day = 1; day <= daysInMonth.value; day++) {
		days.push(new Date(currentYear.value, currentMonth.value, day))
	}

	return days
})

const getEventsForDate = (date: Date | null): CalendarEvent[] => {
	if (!date) return []
	return props.events.filter(event => {
		const eventDate = new Date(event.date)
		return (
			eventDate.getDate() === date.getDate() &&
			eventDate.getMonth() === date.getMonth() &&
			eventDate.getFullYear() === date.getFullYear()
		)
	})
}

const isDateSelected = (date: Date | null): boolean => {
	if (!date || !selectedDate.value) return false
	return (
		date.getDate() === selectedDate.value.getDate() &&
		date.getMonth() === selectedDate.value.getMonth() &&
		date.getFullYear() === selectedDate.value.getFullYear()
	)
}

const isDateDisabled = (date: Date | null): boolean => {
	if (!date) return true
	if (props.minDate && date < props.minDate) return true
	if (props.maxDate && date > props.maxDate) return true
	return false
}

const isToday = (date: Date | null): boolean => {
	if (!date) return false
	const today = new Date()
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	)
}

const handleDateClick = (date: Date) => {
	if (!props.selectable || isDateDisabled(date)) return
	selectedDate.value = new Date(date)
	emit('update:modelValue', new Date(date))
	emit('date-select', new Date(date))
}

const handleEventClick = (event: CalendarEvent, e: Event) => {
	e.stopPropagation()
	emit('event-click', event)
}

const previousMonth = () => {
	currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
	currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
	const today = new Date()
	currentDate.value = new Date(today)
	if (props.selectable) {
		selectedDate.value = new Date(today)
		emit('update:modelValue', new Date(today))
		emit('date-select', new Date(today))
	}
}
</script>

<template>
	<div class="calendar">
		<div class="calendar__header">
			<div class="calendar__navigation">
				<IconButton icon="←" variant="ghost" size="sm" @click="previousMonth" />
				<h3 class="calendar__month-year">{{ monthNames[currentMonth] }} {{ currentYear }}</h3>
				<IconButton icon="→" variant="ghost" size="sm" @click="nextMonth" />
			</div>
			<Button v-if="selectable" variant="outline" size="sm" @click="goToToday"> Hoy </Button>
		</div>
		<div class="calendar__weekdays">
			<div v-for="day in weekDays" :key="day" class="calendar__weekday">{{ day }}</div>
		</div>
		<div class="calendar__grid">
			<div
				v-for="(date, index) in calendarDays"
				:key="index"
				:class="{
					calendar__day: true,
					'calendar__day--empty': !date,
					'calendar__day--today': date && isToday(date),
					'calendar__day--selected': date && isDateSelected(date),
					'calendar__day--disabled': date && isDateDisabled(date),
					'calendar__day--has-events': date && getEventsForDate(date).length > 0,
				}"
				@click="date ? handleDateClick(date) : undefined"
			>
				<span v-if="date" class="calendar__day-number">{{ date.getDate() }}</span>
				<div v-if="date && getEventsForDate(date).length > 0" class="calendar__events">
					<div
						v-for="event in getEventsForDate(date)"
						:key="event.id"
						class="calendar__event"
						:style="{ backgroundColor: event.color || 'var(--token-color-primary-500)' }"
						:title="event.title"
						@click.stop="e => handleEventClick(event, e)"
					></div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.calendar {
	width: 100%;
	background-color: var(--color-bg-primary);
	border-radius: var(--radius-lg);
	padding: var(--spacing-xl);
}

.calendar__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--spacing-xl);
}

.calendar__navigation {
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
}

.calendar__month-year {
	margin: 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	min-width: 180px;
	text-align: center;
}

.calendar__weekdays {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: var(--spacing-xs);
	margin-bottom: var(--spacing-md);
}

.calendar__weekday {
	text-align: center;
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-secondary);
	padding: var(--spacing-sm);
}

.calendar__grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: var(--spacing-xs);
}

.calendar__day {
	aspect-ratio: 1;
	min-height: 60px;
	padding: var(--spacing-xs);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	background-color: var(--color-bg-primary);
	cursor: pointer;
	transition: all var(--transition-base);
	display: flex;
	flex-direction: column;
	position: relative;
}

.calendar__day:hover:not(.calendar__day--disabled):not(.calendar__day--empty) {
	background-color: var(--color-bg-hover);
	border-color: var(--color-border-hover);
}

.calendar__day--empty {
	border: none;
	background: transparent;
	cursor: default;
}

.calendar__day--today {
	border-color: var(--token-color-primary-500);
	border-width: 2px;
}

.calendar__day--selected {
	background-color: var(--token-color-primary-100);
	border-color: var(--token-color-primary-600);
}

.calendar__day--disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.calendar__day-number {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-primary);
}

.calendar__day--selected .calendar__day-number {
	color: var(--token-color-primary-700);
	font-weight: var(--font-weight-semibold);
}

.calendar__events {
	display: flex;
	flex-wrap: wrap;
	gap: 2px;
	margin-top: auto;
	padding-top: var(--spacing-xs);
}

.calendar__event {
	height: 4px;
	border-radius: var(--radius-sm);
	flex: 1;
	min-width: 4px;
	cursor: pointer;
	transition: opacity var(--transition-base);
}

.calendar__event:hover {
	opacity: 0.8;
}
</style>
