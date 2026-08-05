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
};