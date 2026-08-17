// lib/env/schema.ts
import { z } from "zod";

export const envSchema = z.object({
  // Backend
  BACKEND_URL: z.string().url({
    message: "BACKEND_URL debe ser una URL válida",
  }),

  // JWT
  JWT_EXPIRES_MIN: z.coerce
    .number()
    .int()
    .positive({
      message: "JWT_EXPIRES_MIN debe ser un número entero positivo",
    }),

  JWT_REFRESH_EXPIRES_DAYS: z.coerce
    .number()
    .int()
    .positive({
      message: "JWT_REFRESH_EXPIRES_DAYS debe ser un número entero positivo",
    }),

  // Departamentos
  DEPARTAMENTOS: z.string()
    .min(1, {
      message: "DEPARTAMENTOS es requerido y no puede estar vacío",
    })
    .transform((val) => val.split(',').map(d => d.trim()).filter(d => d.length > 0))
    .pipe(z.array(z.string()).min(1, {
      message: "DEPARTAMENTOS debe tener al menos un departamento",
    })),
});

export type Env = z.infer<typeof envSchema>;