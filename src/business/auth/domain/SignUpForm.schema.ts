import { z } from 'zod'

import type { I18nTranslationFunction } from '@/shared/i18n'

export type SignUpFormInput = z.infer<ReturnType<typeof createSignUpFormSchema>>

export const createSignUpFormSchema = (t: I18nTranslationFunction) =>
	z
		.object({
			email: z.string().email({ message: t('validation.email.invalid') }),
			password: z.string().min(6, t('validation.password.minLength', { min: 6 })),
			passwordConfirmation: z.string(),
		})
		.refine(data => data.password === data.passwordConfirmation, {
			message: t('validation.password.mismatch'),
			path: ['passwordConfirmation'],
		})
