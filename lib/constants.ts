// lib/constants.ts
import { getEnv } from "@/lib/env/validate";

const env = getEnv();

export const DEPARTAMENTOS = env.DEPARTAMENTOS;

export const ESTADOS_EMPLEADO = {
  ACTIVO: 'ACTIVO',
  PENDIENTE_BAJA: 'PENDIENTE_BAJA',
  DADO_BAJA: 'DADO_BAJA'
} as const;

export const PAGINACION_DEFAULT = {
  page: 1,
  size: 10
};