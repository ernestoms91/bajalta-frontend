// types/api.ts
export interface CommonResponse<T = unknown> {
  ok: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// TIPOS DE EMPLEADOS
// ============================================

export type EstadoEmpleado = "ACTIVO" | "PENDIENTE_BAJA" | "DADO_BAJA";

export interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  ci: string;
  telefono: string;
  email: string;
  departamento: string;
  observaciones: string | null;
  estado: EstadoEmpleado;
  fecha_ingreso: string;
  fecha_baja: string | null;
  motivo_baja: string | null;
  veces_recontratado: number;
  historial_fechas: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface EmpleadosResponse {
  items: Empleado[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface EmpleadosQueryParams {
  page?: number;
  size?: number;
  estado?: EstadoEmpleado | null;
  departamento?: string | null;
  search?: string | null;
}

// ============================================
// TIPOS PARA CREAR/ACTUALIZAR EMPLEADOS
// ============================================

export interface CreateEmpleadoPayload {
  nombre: string;
  apellidos: string;
  ci: string;
  telefono: string;
  email: string;
  departamento: string;
  observaciones?: string;
  fecha_ingreso?: string;
}

export interface UpdateEmpleadoPayload extends Partial<CreateEmpleadoPayload> {
  id: number;
  estado?: EstadoEmpleado;
  fecha_baja?: string | null;
  motivo_baja?: string | null;
}