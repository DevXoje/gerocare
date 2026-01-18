import { z } from 'zod'

export const SignUpFormSchema = z
  .object({
    email: z.string().email({ message: 'Por favor, ingresa un email válido' }),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmation'],
  })

export type SignUpFormInput = z.infer<typeof SignUpFormSchema>
