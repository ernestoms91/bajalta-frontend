// lib/env/validate.ts
import { envSchema } from "./schema";
import { z } from "zod";

let cachedEnv: ReturnType<typeof envSchema.parse> | null = null;

export function validateEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("\n Error: Variables de entorno inválidas:\n");

    const errorTree = z.treeifyError(result.error);
    console.error(errorTree);
    
    console.error("\n La aplicación no puede iniciar. Corrige las variables y vuelve a intentarlo.\n");
    process.exit(1);
  }

  console.log(" Variables de entorno validadas correctamente");
  cachedEnv = result.data;
  return result.data;
}

export function getEnv() {
  return validateEnv();
}