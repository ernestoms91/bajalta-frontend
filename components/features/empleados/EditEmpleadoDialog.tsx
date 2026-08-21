// components/features/empleados/EditEmpleadoDialog.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Empleado } from "@/types/api";
import { updateEmpleado } from "@/app/actions/empleado.actions";

interface EditEmpleadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleado: Empleado;
  onSuccess: (updated: Empleado) => void;
  departamentos: string[];
}

export function EditEmpleadoDialog({
  open,
  onOpenChange,
  empleado,
  onSuccess,
  departamentos,
}: EditEmpleadoDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    nombre: empleado.nombre,
    apellidos: empleado.apellidos,
    ci: empleado.ci,
    telefono: empleado.telefono,
    email: empleado.email,
    departamento: empleado.departamento || "",
    observaciones: empleado.observaciones || "",
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await updateEmpleado(empleado.id, {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        ci: formData.ci,
        telefono: formData.telefono,
        email: formData.email,
        departamento: formData.departamento,
        observaciones: formData.observaciones,
      });
      
      if (result.success && result.data) {
        toast.success("Empleado actualizado correctamente");
        onSuccess(result.data);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al actualizar el empleado");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Empleado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre
              </Label>
              <Input
                id="nombre"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="bg-background border-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos" className="text-foreground">
                Apellidos
              </Label>
              <Input
                id="apellidos"
                required
                value={formData.apellidos}
                onChange={(e) =>
                  setFormData({ ...formData, apellidos: e.target.value })
                }
                className="bg-background border-input text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ci" className="text-foreground">
                CI
              </Label>
              <Input
                id="ci"
                required
                value={formData.ci}
                onChange={(e) =>
                  setFormData({ ...formData, ci: e.target.value })
                }
                className="bg-background border-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground">
                Teléfono
              </Label>
              <Input
                id="telefono"
                required
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="bg-background border-input text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-background border-input text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-foreground">
                Departamento
              </Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) =>
                  setFormData({ ...formData, departamento: value || "" })
                }
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {departamentos.map((depto) => (
                    <SelectItem key={depto} value={depto}>
                      {depto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-foreground">
              Observaciones
            </Label>
            <Input
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="bg-background border-input text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}