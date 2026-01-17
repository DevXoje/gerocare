import { ref } from 'vue'
import { type Result, Ok, Err } from '@/shared/domain/Result'

export interface ResidentFormData {
  firstName: string
  lastName: string
  dateOfBirth?: Date
  photoURL?: string
  medicalInfo: {
    allergies: string[]
    chronicConditions: string[]
    medications: string[]
    dietaryRestrictions: string[]
  }
  emergencyContacts: {
    name: string
    relationship: string
    phone: string
    email?: string
  }[]
  assignedCaregivers: string[]
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function useResidentForm() {
  const form = ref<ResidentFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: undefined,
    photoURL: undefined,
    medicalInfo: {
      allergies: [],
      chronicConditions: [],
      medications: [],
      dietaryRestrictions: [],
    },
    emergencyContacts: [],
    assignedCaregivers: [],
  })

  const validate = (): Result<ResidentFormData, string> => {
    if (!form.value.firstName || form.value.firstName.trim() === '') {
      return Err('firstName is required')
    }

    if (!form.value.lastName || form.value.lastName.trim() === '') {
      return Err('lastName is required')
    }

    if (!form.value.dateOfBirth) {
      return Err('dateOfBirth is required')
    }

    // Validate date is not in the future
    if (form.value.dateOfBirth > new Date()) {
      return Err('dateOfBirth cannot be in the future')
    }

    // Validate email format in emergency contacts
    for (const contact of form.value.emergencyContacts) {
      if (contact.email && !isValidEmail(contact.email)) {
        return Err(`Invalid email format: ${contact.email}`)
      }
    }

    return Ok(form.value)
  }

  const reset = () => {
    form.value = {
      firstName: '',
      lastName: '',
      dateOfBirth: undefined,
      photoURL: undefined,
      medicalInfo: {
        allergies: [],
        chronicConditions: [],
        medications: [],
        dietaryRestrictions: [],
      },
      emergencyContacts: [],
      assignedCaregivers: [],
    }
  }

  return {
    form,
    validate,
    reset,
  }
}

