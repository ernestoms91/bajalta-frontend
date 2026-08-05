// app/page.tsx
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/actions/auth.actions";
import { ActionResponse } from "@/types/api";

const initialState: ActionResponse<string> = {
  success: false,
  error: undefined,
  data: undefined,
};

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<
    ActionResponse<string>,
    FormData
  >(loginAction, initialState);

  const errorMessage = typeof state?.error === "string" ? state.error : undefined;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-background">
      <Card className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-lg border border-border p-0 gap-0">
        {/* Columna Izquierda: Branding */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-primary text-primary-foreground">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏢</span>
              <h1 className="text-xl font-semibold tracking-tight">Bajalta</h1>
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Optimizando Recursos Humanos.</h2>
            <p className="text-base opacity-90 max-w-[400px]">
              Accede a tu dashboard completo para la gestión de empleados, 
              procesamiento de nóminas y análisis de rendimiento organizacional.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-primary object-cover" src="https://i.pravatar.cc/32?img=1" alt="Usuario" />
              <img className="w-8 h-8 rounded-full border-2 border-primary object-cover" src="https://i.pravatar.cc/32?img=2" alt="Usuario" />
              <img className="w-8 h-8 rounded-full border-2 border-primary object-cover" src="https://i.pravatar.cc/32?img=3" alt="Usuario" />
            </div>
            <span className="text-sm font-medium">Confían 500+ empresas</span>
          </div>
        </div>

        {/* Columna Derecha: Login */}
        <CardContent className="flex flex-col justify-center p-8 md:p-12 bg-card">
          <div className="max-w-[400px] mx-auto w-full">
            {/* Branding móvil */}
            <div className="md:hidden flex items-center gap-2 mb-6">
              <span className="text-2xl text-primary">🏢</span>
              <h1 className="text-xl font-semibold">Bajalta</h1>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Bienvenido de nuevo</h2>
              <p className="text-sm text-muted-foreground">
                Introduce tus credenciales para acceder al portal de gestión.
              </p>
            </div>

            {/* Mensaje de error */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                {errorMessage}
              </div>
            )}

            {/* Mensaje de éxito (opcional) */}
            {state?.success && state?.data && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200">
                Login exitoso. Redirigiendo...
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider">
                  Usuario
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="nombre.usuario"
                  className="w-full"
                  required
                  disabled={isPending}
                />
              </div>

              {/* Contraseña con ojo */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider">
                    Contraseña
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pr-10"
                    required
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón Login */}
              <Button
                type="submit"
                className="w-full py-4 text-sm font-semibold uppercase tracking-wider"
                disabled={isPending}
              >
                {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link href="#" className="text-primary font-semibold hover:underline">
                  Contacta al Administrador
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}