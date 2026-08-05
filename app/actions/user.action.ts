// app/actions/user.actions.ts
"use server";

import { fetchWithAuth } from "@/lib/fetch-utils";
import { ActionResponse, User } from "@/types/api";

export async function getCurrentUser(): Promise<ActionResponse<User>> {
  const response = await fetchWithAuth<User>("/auth/me", {
    method: "GET",
  });

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || "Error al obtener usuario",
      data: undefined,
    };
  }

  return {
    success: true,
    data: response.data,
  };
}