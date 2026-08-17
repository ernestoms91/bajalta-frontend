// app/(authenticated)/empleados/page.tsx
import { getDepartamentos } from "@/app/actions/departamentos.actions";
import { getAllEmpleados } from "@/app/actions/empleado.actions";
import { EmpleadosTableClient } from "@/components/features/empleados/EmpleadosTableClient";


interface EmpleadosPageProps {
  searchParams: Promise<{
    page?: string;
    size?: string;
  }>;
}

export default async function EmpleadosPage({ searchParams }: EmpleadosPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = Number(params.size) || 15;

  const result = await getAllEmpleados(currentPage, pageSize);
  const departamentos = await getDepartamentos(); 

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar empleados");
  }

  // Key que cambia cuando el total o la página cambian
  const key = `${currentPage}-${pageSize}-${result.data.total}`;

  return (
    <EmpleadosTableClient key={key} initialData={result} currentPage={currentPage} departamentos={departamentos}/>
  );
}