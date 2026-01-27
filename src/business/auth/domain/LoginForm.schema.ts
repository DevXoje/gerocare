import { z } from 'zod'

import type { I18nTranslationFunction } from '@/shared/i18n'

export type LoginFormInput = z.infer<ReturnType<typeof createLoginFormSchema>>

export const createLoginFormSchema = (t: I18nTranslationFunction) =>
	z.object({
		email: z.string().min(1, t('validation.email.required')),
		password: z.string().min(1, t('validation.password.required')),
	})
