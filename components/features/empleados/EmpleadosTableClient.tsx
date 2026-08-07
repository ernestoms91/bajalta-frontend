// components/features/empleados/EmpleadosTableClient.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, User, Mail, Phone, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/common/Pagination";
import { Empleado } from "@/types/api";
import { CreateEmpleadoDialog } from "./CreateEmpleadoDialog";
import { EditEmpleadoDialog } from "./EditEmpleadoDialog";
import { deleteEmpleado } from "@/app/actions/empleado.actions";

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

export function EmpleadosTableClient({ initialData, currentPage }: EmpleadosTableClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [empleados, setEmpleados] = useState(initialData.data?.items || []);
  const [totalItems, setTotalItems] = useState(initialData.data?.total || 0);
  const pageSize = initialData.data?.per_page || 10;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
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

  const handleDeleteClick = useCallback(
    (empleadoId: number, nombre: string) => {
      setEmpleadoToDelete({ id: empleadoId, nombre });
      setDeleteDialogOpen(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!empleadoToDelete) return;

    startTransition(async () => {
      const result = await deleteEmpleado(empleadoToDelete.id);

      if (result.success) {
        toast.success("Empleado eliminado correctamente");

        const newEmpleados = empleados.filter(
          (emp) => emp.id !== empleadoToDelete.id
        );
        const newTotal = totalItems - 1;

        setEmpleados(newEmpleados);
        setTotalItems(newTotal);

        if (newEmpleados.length === 0 && currentPage > 1) {
          router.push(`/empleados?page=${currentPage - 1}&size=${pageSize}`);
        } else if (newEmpleados.length < pageSize && newTotal >= pageSize) {
          router.push(`/empleados?page=${currentPage}&size=${pageSize}`);
        }
      } else {
        toast.error(result.error || "Error al eliminar el empleado");
      }

      setDeleteDialogOpen(false);
      setEmpleadoToDelete(null);
    });
  }, [empleadoToDelete, empleados, totalItems, currentPage, pageSize, router]);

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

              <CreateEmpleadoDialog onSuccess={handleEmpleadoCreated} />
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
                            onClick={() => handleDeleteClick(empleado.id, empleado.nombre)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteClick(empleado.id, empleado.nombre)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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

      {/* Diálogos */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar empleado"
        description={`¿Estás seguro de que quieres eliminar a "${empleadoToDelete?.nombre}"?`}
        confirmText="Eliminar"
        destructive={true}
        onConfirm={handleConfirmDelete}
      />

      {empleadoToEdit && (
        <EditEmpleadoDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          empleado={empleadoToEdit}
          onSuccess={handleEmpleadoUpdated}
        />
      )}
    </>
  );
}