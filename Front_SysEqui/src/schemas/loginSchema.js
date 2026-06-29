import z from 'zod';

// Informar en el dni y la contraseña un mensaje de error

const loginSchema = z.object({
  dni: z
    .number({
      invalid_type_error: 'El DNI no es válido',
      message: 'El DNI debe tener al menos 7 caracteres',
    })
    .max(9999999999),
  password: z.string({
    invalid_type_error: 'La contraseña no es válida',
    message: 'La contraseña debe tener al menos 6 caracteres',
  }),
  remember: z.boolean().default(false),
});

export default loginSchema;
