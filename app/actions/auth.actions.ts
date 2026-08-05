// app/actions/auth.actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchWithoutAuth } from "@/lib/fetch-utils";
import { ActionResponse, LoginResponse } from "@/types/api";

export async function loginAction(
  prevState: ActionResponse<string> | null,
  formData: FormData,
): Promise<ActionResponse<string>> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return {
      success: false,
      error: "Usuario y contraseña son requeridos",
    };
  }

  const response = await fetchWithoutAuth<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || "Credenciales incorrectas",
    };
  }

  const { access_token, refresh_token, user } = response.data;

  const cookieStore = await cookies();

  cookieStore.set("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30,
    path: "/",
  });

  cookieStore.set("refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/empleados");
}