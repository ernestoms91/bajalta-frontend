// lib/fetch-utils.ts
"use server";

import { cookies } from "next/headers";
import { ActionResponse, CommonResponse } from "@/types/api";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not defined in environment variables");
}

// ============================================
// LOGGER UTILITY (solo desarrollo)
// ============================================
const isDev = process.env.NODE_ENV === "development";

function logFetch(method: string, url: string, status?: number, error?: unknown) {
  if (!isDev) return;
  const statusText = status ? ` ${status}` : "";
  const errorText = error ? ` - ${error instanceof Error ? error.message : String(error)}` : "";
  console.log(`[FETCH] ${method} ${url}${statusText}${errorText}`);
}

// ============================================
// GET TOKEN (fuente única de verdad)
// ============================================
async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}

// ============================================
// GET AUTH HEADERS
// ============================================
export async function getAuthHeaders() {
  const token = await getToken();

  if (!token) {
    if (isDev) console.log("[AUTH] No token found in cookies");
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ============================================
// GET ERROR MESSAGE
// ============================================
export async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data.message || data.error || `Error ${response.status}`;
  } catch {
    try {
      return await response.text();
    } catch {
      return `Error ${response.status}`;
    }
  }
}

// ============================================
// RESOLVE FULL URL
// ============================================
function resolveUrl(url: string): string {
  return url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
}

// ============================================
// HANDLE RESPONSE (lógica compartida)
// ============================================
async function handleResponse<T>(
  response: Response,
  method: string,
  fullUrl: string,
): Promise<ActionResponse<T>> {
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);

    if (response.status === 401) {
      logFetch(method, fullUrl, 401, "Token expired");
      return {
        success: false,
        error: "UNAUTHORIZED",
        data: undefined,
      };
    }

    logFetch(method, fullUrl, response.status, errorMessage);
    return {
      success: false,
      error: errorMessage,
      data: undefined,
    };
  }

  const responseData: CommonResponse<T> = await response.json();
  logFetch(method, fullUrl, response.status);

  return {
    success: responseData.ok,
    error: responseData.ok ? undefined : responseData.message,
    data: responseData.ok ? (responseData.data as T) : undefined,
  };
}

// ============================================
// HANDLE FETCH ERROR (catch compartido)
// ============================================
function handleFetchError<T>(
  error: unknown,
  method: string,
  fullUrl: string,
  label: string,
): ActionResponse<T> {
  logFetch(method, fullUrl, undefined, error);
  console.error(`[FETCH] Error en ${label}:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Error de conexión",
    data: undefined,
  };
}

// ============================================
// FETCH WITHOUT AUTH
// ============================================
export async function fetchWithoutAuth<T>(
  url: string,
  options?: RequestInit,
): Promise<ActionResponse<T>> {
  const method = options?.method || "GET";
  const fullUrl = resolveUrl(url);

  try {
    logFetch(method, fullUrl);

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    return await handleResponse<T>(response, method, fullUrl);
  } catch (error) {
    return handleFetchError<T>(error, method, fullUrl, "fetchWithoutAuth");
  }
}

// ============================================
// FETCH WITH AUTH
// ============================================
export async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit,
): Promise<ActionResponse<T>> {
  const method = options?.method || "GET";
  const fullUrl = resolveUrl(url);

  try {
    const headers = await getAuthHeaders();

    if (!headers) {
      logFetch(method, fullUrl, 401, "No token");
      return {
        success: false,
        error: "UNAUTHORIZED",
        data: undefined,
      };
    }

    const isFormData = options?.body instanceof FormData;
    const requestHeaders = isFormData
      ? { Authorization: headers.Authorization }
      : { ...headers, "Content-Type": "application/json" };

    logFetch(method, fullUrl);

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...requestHeaders,
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    return await handleResponse<T>(response, method, fullUrl);
  } catch (error) {
    return handleFetchError<T>(error, method, fullUrl, "fetchWithAuth");
  }
}

// ============================================
// FETCH WITH AUTH FORM DATA
// ============================================
export async function fetchWithAuthFormData<T>(
  url: string,
  formData: FormData,
  options?: RequestInit,
): Promise<ActionResponse<T>> {
  const method = options?.method || "POST";
  const fullUrl = resolveUrl(url);

  try {
    const token = await getToken();

    if (!token) {
      logFetch(method, fullUrl, 401, "No token");
      return {
        success: false,
        error: "UNAUTHORIZED",
        data: undefined,
      };
    }

    logFetch(method, fullUrl);

    const response = await fetch(fullUrl, {
      ...options,
      method: options?.method || "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
      body: formData,
      cache: "no-store",
    });

    return await handleResponse<T>(response, method, fullUrl);
  } catch (error) {
    return handleFetchError<T>(error, method, fullUrl, "fetchWithAuthFormData");
  }
}