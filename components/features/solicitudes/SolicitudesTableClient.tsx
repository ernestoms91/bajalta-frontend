// components/features/solicitudes/SolicitudesTableClient.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Mail,
  Phone,
  AlertCircle,
  Check,
  Clock,
  UserX,
  UserCheck,
  MoreVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";
import { Empleado, User as UserType } from "@/types/api";
import {
  activarEmpleado,
  completarBajaEmpleado,
} from "@/app/actions/empleado.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SolicitudesTableClientProps {
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
  user: UserType;
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

export function SolicitudesTableClient({
  initialData,
  currentPage,
  user,
}: SolicitudesTableClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const [solicitudes, setSolicitudes] = useState(initialData.data?.items || []);
  const [totalItems, setTotalItems] = useState(initialData.data?.total || 0);
  const pageSize = initialData.data?.per_page || 10;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const isAdmin = user.is_admin;

  const [bajaDialogOpen, setBajaDialogOpen] = useState(false);
  const [empleadoToDarBaja, setEmpleadoToDarBaja] = useState<Empleado | null>(
    null,
  );
  const [motivoBaja, setMotivoBaja] = useState("");
  const [urgenteBaja, setUrgenteBaja] = useState(false);

  const [reactivarDialogOpen, setReactivarDialogOpen] = useState(false);
  const [empleadoToReactivar, setEmpleadoToReactivar] =
    useState<Empleado | null>(null);

  const handleDarBajaClick = useCallback((empleado: Empleado) => {
    setEmpleadoToDarBaja(empleado);
    setMotivoBaja("");
    setUrgenteBaja(false);
    setBajaDialogOpen(true);
  }, []);

  const handleReactivarClick = useCallback((empleado: Empleado) => {
    setEmpleadoToReactivar(empleado);
    setReactivarDialogOpen(true);
  }, []);

  const handleConfirmarBaja = useCallback(async () => {
    if (!empleadoToDarBaja) return;

    startTransition(async () => {
      const result = await completarBajaEmpleado(empleadoToDarBaja.id);

      if (result.success && result.data) {
        const completado = result.data;
        toast.success(
          `Baja completada para ${completado.nombre} ${completado.apellidos}`,
        );

        setSolicitudes((prev) =>
          prev.filter((emp) => emp.id !== completado.id),
        );
        setTotalItems((prev) => prev - 1);

        setBajaDialogOpen(false);
        setEmpleadoToDarBaja(null);
        setMotivoBaja("");
        setUrgenteBaja(false);
      } else {
        toast.error(result.error || "Error al completar la baja");
      }
    });
  }, [empleadoToDarBaja]);

  const handleConfirmarReactivar = useCallback(async () => {
    if (!empleadoToReactivar) return;

    startTransition(async () => {
      const result = await activarEmpleado(empleadoToReactivar.id);

      if (result.success && result.data) {
        const updatedEmpleado = result.data;
        toast.success(
          `Empleado ${updatedEmpleado.nombre} ${updatedEmpleado.apellidos} reactivado correctamente`,
        );

        setSolicitudes((prev) =>
          prev.filter((emp) => emp.id !== updatedEmpleado.id),
        );
        setTotalItems((prev) => prev - 1);
        setReactivarDialogOpen(false);
        setEmpleadoToReactivar(null);
      } else {
        toast.error(result.error || "Error al reactivar el empleado");
      }
    });
  }, [empleadoToReactivar]);

  const filteredSolicitudes =
    searchQuery.trim() === ""
      ? solicitudes
      : solicitudes.filter((emp) =>
          `${emp.nombre} ${emp.apellidos} ${emp.ci} ${emp.departamento} ${emp.motivo_baja || ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        );

  const handlePageChange = (page: number) => {
    router.push(`/solicitudes?page=${page}&size=${pageSize}`);
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
              <h1 className="text-lg font-bold md:text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Solicitudes de Baja
              </h1>
              <span className="text-sm text-muted-foreground">
                ({totalItems} pendientes)
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar solicitudes..."
                value={searchQuery}
                onChange={handleSearch}
                className="h-9 w-full sm:w-48 pl-9 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden p-4">
          {filteredSolicitudes.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No se encontraron solicitudes"
                    : "No hay solicitudes de baja pendientes"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* 📱 Vista Móvil y Tablet - Tarjetas */}
              <div className="block lg:hidden space-y-3">
                {filteredSolicitudes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                            <User className="h-4 w-4 text-amber-500" />
                          </div>
                          <span className="font-medium text-foreground truncate">
                            {solicitud.nombre} {solicitud.apellidos}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <span className="font-medium text-foreground">
                              CI:
                            </span>
                            {solicitud.ci}
                          </p>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {solicitud.telefono}
                          </p>
                          <p className="flex items-center gap-1 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{solicitud.email}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="font-medium text-foreground">
                              Depto:
                            </span>
                            {solicitud.departamento}
                          </p>
                          {solicitud.motivo_baja && (
                            <p className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span className="text-xs">
                                {solicitud.motivo_baja}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-2">
                        <span className={estadoClasses[solicitud.estado]}>
                          {estadoLabels[solicitud.estado]}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleReactivarClick(solicitud)}
                              className="text-green-600 cursor-pointer"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Reactivar
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleDarBajaClick(solicitud)}
                                className="text-destructive cursor-pointer"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Dar de Baja
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 💻 Vista Desktop - Tabla */}
              <div className="hidden lg:block h-full">
                <div className="h-full rounded-md border border-border bg-card overflow-hidden">
                  <div className="h-full overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted/50 z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">
                              Empleado
                            </div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">
                              CI
                            </div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap hidden xl:table-cell">
                            <div className="text-xs uppercase tracking-wider">
                              Email
                            </div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap hidden 2xl:table-cell">
                            <div className="text-xs uppercase tracking-wider">
                              Departamento
                            </div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">
                              Motivo
                            </div>
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">
                              Estado
                            </div>
                          </th>
                          <th className="px-3 py-2.5 text-right font-medium text-foreground whitespace-nowrap">
                            <div className="text-xs uppercase tracking-wider">
                              Acciones
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSolicitudes.map((solicitud) => (
                          <tr
                            key={solicitud.id}
                            className="border-t border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                                  <User className="h-3.5 w-3.5 text-amber-500" />
                                </div>
                                <span className="font-medium text-foreground text-sm truncate max-w-[120px]">
                                  {solicitud.nombre} {solicitud.apellidos}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-foreground text-sm whitespace-nowrap">
                              {solicitud.ci}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-sm hidden xl:table-cell">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[120px]">
                                  {solicitud.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-sm hidden 2xl:table-cell">
                              {solicitud.departamento}
                            </td>
                            <td className="px-3 py-2.5 text-amber-600 dark:text-amber-400 text-sm max-w-[200px] truncate">
                              {solicitud.motivo_baja || "—"}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={estadoClasses[solicitud.estado]}>
                                {estadoLabels[solicitud.estado]}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                  onClick={() =>
                                    handleReactivarClick(solicitud)
                                  }
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  Reactivar
                                </Button>
                                {isAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() =>
                                      handleDarBajaClick(solicitud)
                                    }
                                  >
                                    <UserX className="h-3.5 w-3.5 mr-1" />
                                    Dar de Baja
                                  </Button>
                                )}
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
            itemLabel="solicitud"
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Diálogo para reactivar */}
      <Dialog open={reactivarDialogOpen} onOpenChange={setReactivarDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Reactivar Empleado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que quieres reactivar a{" "}
              <span className="font-medium text-foreground">
                {empleadoToReactivar?.nombre} {empleadoToReactivar?.apellidos}
              </span>
              ?
            </p>
            <p className="text-sm text-muted-foreground">
              El empleado volverá a estado{" "}
              <span className="badge-activo">Activo</span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setReactivarDialogOpen(false);
                setEmpleadoToReactivar(null);
              }}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarReactivar}
              disabled={isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isPending ? "Procesando..." : "Reactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para dar de baja - solo admin */}
      {isAdmin && (
        <Dialog open={bajaDialogOpen} onOpenChange={setBajaDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Completar Baja de Empleado
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de que quieres completar la baja de{" "}
                <span className="font-medium text-foreground">
                  {empleadoToDarBaja?.nombre} {empleadoToDarBaja?.apellidos}
                </span>
                ?
              </p>
              {empleadoToDarBaja?.motivo_baja && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Motivo:</span>{" "}
                  {empleadoToDarBaja.motivo_baja}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBajaDialogOpen(false);
                  setEmpleadoToDarBaja(null);
                }}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmarBaja}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? "Procesando..." : "Completar Baja"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
