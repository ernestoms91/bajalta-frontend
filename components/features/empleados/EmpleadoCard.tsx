// components/features/empleados/EmpleadoCard.tsx
"use client";

import { useState } from "react";
import { MoreVertical, Edit, Trash2, User, Mail, Phone } from "lucide-react";
import { Empleado } from "@/types/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditEmpleadoDialog } from "./EditEmpleadoDialog";

// Usando las clases personalizadas de globals.css
const estadoClasses = {
  ACTIVO: "badge-activo",
  PENDIENTE_BAJA: "badge-pendiente",
  DADO_BAJA: "badge-dado",
};

const estadoLabels = {
  ACTIVO: "Activo",
  PENDIENTE_BAJA: "Pendiente de Baja",
  DADO_BAJA: "Dado de Baja",
};

interface EmpleadoCardProps {
  empleado: Empleado;
  onDelete: () => void;
  onUpdate: (updated: Empleado) => void;
}

export function EmpleadoCard({
  empleado,
  onDelete,
  onUpdate,
}: EmpleadoCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {empleado.nombre} {empleado.apellidos}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {/*  Usando las clases personalizadas */}
                  <span className={estadoClasses[empleado.estado]}>
                    {estadoLabels[empleado.estado]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    CI: {empleado.ci}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{empleado.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{empleado.telefono}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Departamento:</span>{" "}
                {empleado.departamento}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Ingreso:</span>{" "}
                {new Date(empleado.fecha_ingreso).toLocaleDateString("es-ES")}
              </div>
            </div>

            {empleado.observaciones && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Observaciones:</span>{" "}
                {empleado.observaciones}
              </p>
            )}

            {empleado.veces_recontratado > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Recontratado {empleado.veces_recontratado}{" "}
                {empleado.veces_recontratado === 1 ? "vez" : "veces"}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="bg-background border-border">
              <DropdownMenuItem 
                onClick={() => setEditDialogOpen(true)}
                className="text-foreground hover:bg-muted"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive hover:bg-muted"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditEmpleadoDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        empleado={empleado}
        onSuccess={onUpdate}
      />
    </>
  );
}