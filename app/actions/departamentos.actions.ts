// app/actions/departamentos.actions.ts
"use server";

import { getEnv } from "@/lib/env/validate";

export async function getDepartamentos(): Promise<string[]> {
  const env = getEnv();
  return env.DEPARTAMENTOS;
}