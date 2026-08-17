// components/features/empleados/EmpleadosTableClient.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, UserX, User, Mail, Phone, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";
import { Empleado } from "@/types/api";
import { CreateEmpleadoDialog } from "./CreateEmpleadoDialog";
import { EditEmpleadoDialog } from "./EditEmpleadoDialog";
import { darBajaEmpleado } from "@/app/actions/empleado.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmpleadosTableClientProps {
  initialData: {
    success: boolean;
    error?: string;
    data?: {
      items: Empleado[];
      total: number;
      page: number;
      per_page: number;
      pages: number;
    };
  };
  currentPage: number;
  departamentos: string[]
}

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

export function EmpleadosTableClient({ initialData, currentPage, departamentos }: EmpleadosTableClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [empleados, setEmpleados] = useState(initialData.data?.items || []);
  const [totalItems, setTotalItems] = useState(initialData.data?.total || 0);
  const pageSize = initialData.data?.per_page || 10;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [isPending, startTransition] = useTransition();
  
  // Estado para diálogo de baja
  const [bajaDialogOpen, setBajaDialogOpen] = useState(false);
  const [empleadoToDarBaja, setEmpleadoToDarBaja] = useState<Empleado | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [urgenteBaja, setUrgenteBaja] = useState(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [empleadoToEdit, setEmpleadoToEdit] = useState<Empleado | null>(null);

  const handleEmpleadoCreated = useCallback(
    (newEmpleado: Empleado) => {
      setEmpleados((prev) => {
        const newList = [newEmpleado, ...prev];
        if (newList.length > pageSize) {
          return newList.slice(0, pageSize);
        }
        return newList;
      });
      setTotalItems((prev) => prev + 1);
    },
    [pageSize]
  );

  const handleEmpleadoUpdated = useCallback(
    (updatedEmpleado: Empleado) => {
      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id === updatedEmpleado.id ? updatedEmpleado : emp
        )
      );
      setEditDialogOpen(false);
      setEmpleadoToEdit(null);
    },
    []
  );

  const handleDarBajaClick = useCallback((empleado: Empleado) => {
    setEmpleadoToDarBaja(empleado);
    setMotivoBaja("");
    setUrgenteBaja(false);
    setBajaDialogOpen(true);
  }, []);

  const handleConfirmarBaja = useCallback(async () => {
    if (!empleadoToDarBaja) return;

    if (!motivoBaja.trim()) {
      toast.error("Debes ingresar un motivo para la baja");
      return;
    }

    startTransition(async () => {
      const result = await darBajaEmpleado(
        empleadoToDarBaja.id,
        motivoBaja,
        urgenteBaja
      );

      if (result.success && result.data) {
        const updatedEmpleado = result.data;
        toast.success(`Baja solicitada para ${updatedEmpleado.nombre} ${updatedEmpleado.apellidos}`);
        
        setEmpleados((prev) =>
          prev.map((emp) =>
            emp.id === updatedEmpleado.id ? updatedEmpleado : emp
          )
        );
        
        setBajaDialogOpen(false);
        setEmpleadoToDarBaja(null);
        setMotivoBaja("");
        setUrgenteBaja(false);
      } else {
        toast.error(result.error || "Error al solicitar la baja");
      }
    });
  }, [empleadoToDarBaja, motivoBaja, urgenteBaja]);

  const handleEditClick = useCallback((empleado: Empleado) => {
    setEmpleadoToEdit(empleado);
    setEditDialogOpen(true);
  }, []);

  const filteredEmpleados = searchQuery.trim() === ""
    ? empleados
    : empleados.filter((emp) =>
        `${emp.nombre} ${emp.apellidos} ${emp.ci} ${emp.telefono} ${emp.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

  const handlePageChange = (page: number) => {
    router.push(`/empleados?page=${page}&size=${pageSize}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold md:text-xl">Empleados</h1>
              <span className="text-sm text-muted-foreground">
                ({totalItems})
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="h-9 w-full sm:w-48 pl-9 text-sm"
                />
              </div>

              <CreateEmpleadoDialog onSuccess={handleEmpleadoCreated} departamentos={departamentos} />
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden p-4">
          {filteredEmpleados.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                {searchQuery ? "No se encontraron empleados" : "No hay empleados registrados"}
              </p>
            </div>
          ) : (
            <>
              {/* 📱 Vista Móvil - Tarjetas */}
              <div className="block sm:hidden space-y-3">
                {filteredEmpleados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground truncate">
                            {empleado.nombre} {empleado.apellidos}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <span className="font-medium text-foreground">CI:</span>
                            {empleado.ci}
                          </p>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {empleado.telefono}
                          </p>
                          <p className="flex items-center gap-1 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{empleado.email}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="font-medium text-foreground">Depto:</span>
                            {empleado.departamento}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-2">
                        <span className={estadoClasses[empleado.estado]}>
                          {estadoLabels[empleado.estado]}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEditClick(empleado)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDarBajaClick(empleado)}
                            title="Solicitar baja"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 💻 Vista Desktop/Tablet - Tabla */}
              <div className="hidden sm:block h-full">
                <div className="h-full rounded-md border border-border bg-card overflow-hidden">
                  <div className="h-full overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted/50 z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">Nombre</div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap hidden sm:table-cell">
                            <div className="text-xs uppercase tracking-wider">CI</div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap hidden sm:table-cell">
                            <div className="text-xs uppercase tracking-wider">Teléfono</div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap hidden md:table-cell">
                            <div className="text-xs uppercase tracking-wider">Email</div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap hidden lg:table-cell">
                            <div className="text-xs uppercase tracking-wider">Departamento</div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">Estado</div>
                          </th>
                          <th className="px-3 py-2.5 text-right font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">Acciones</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmpleados.map((empleado) => (
                          <tr key={empleado.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="font-medium text-foreground text-sm truncate max-w-[100px] sm:max-w-none">
                                  {empleado.nombre} {empleado.apellidos}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-foreground text-sm whitespace-nowrap hidden sm:table-cell">
                              {empleado.ci}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-sm whitespace-nowrap hidden sm:table-cell">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span>{empleado.telefono}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-sm hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[120px]">{empleado.email}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-sm hidden lg:table-cell">
                              <span className="truncate max-w-[100px] block">
                                {empleado.departamento}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={estadoClasses[empleado.estado]}>
                                {estadoLabels[empleado.estado]}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleEditClick(empleado)}
                                  title="Editar"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDarBajaClick(empleado)}
                                  title="Solicitar baja"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Paginación */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemLabel="empleado"
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Diálogo para dar de baja */}
      <Dialog open={bajaDialogOpen} onOpenChange={setBajaDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Solicitar Baja de Empleado
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Vas a solicitar la baja de <span className="font-medium text-foreground">
                  {empleadoToDarBaja?.nombre} {empleadoToDarBaja?.apellidos}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Estado actual: <span className={estadoClasses[empleadoToDarBaja?.estado || "ACTIVO"]}>
                  {estadoLabels[empleadoToDarBaja?.estado || "ACTIVO"]}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo" className="text-foreground">
                Motivo de la baja <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Describe el motivo de la baja..."
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="bg-background border-input text-foreground min-h-[100px]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgente"
                checked={urgenteBaja}
                onChange={(e) => setUrgenteBaja(e.target.checked)}
                className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring"
              />
              <Label htmlFor="urgente" className="text-foreground cursor-pointer">
                Marcar como urgente
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBajaDialogOpen(false);
                setEmpleadoToDarBaja(null);
                setMotivoBaja("");
                setUrgenteBaja(false);
              }}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarBaja}
              disabled={isPending || !motivoBaja.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Solicitando..." : "Solicitar Baja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {empleadoToEdit && (
        <EditEmpleadoDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          empleado={empleadoToEdit}
          onSuccess={handleEmpleadoUpdated}
          departamentos={departamentos}
        />
      )}
    </>
  );
}