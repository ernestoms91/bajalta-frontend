// app/(authenticated)/solicitudes/page.tsx
import { getEmpleadosPendientesBaja } from "@/app/actions/empleado.actions";
import { getCurrentUser } from "@/app/actions/user.action";
import { SolicitudesTableClient } from "@/components/features/solicitudes/SolicitudesTableClient";
import { redirect } from "next/navigation";

interface SolicitudesPageProps {
  searchParams: Promise<{
    page?: string;
    size?: string;
  }>;
}

export default async function SolicitudesPage({ searchParams }: SolicitudesPageProps) {

  const userResponse = await getCurrentUser();
  
  if (!userResponse.success || !userResponse.data) {
    redirect("/login");
  }

  const user = userResponse.data;

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = Number(params.size) || 15;

  const result = await getEmpleadosPendientesBaja(currentPage, pageSize);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar solicitudes de baja");
  }

  const key = `${currentPage}-${pageSize}-${result.data.total}`;

  return (
    <SolicitudesTableClient 
      key={key} 
      initialData={result} 
      currentPage={currentPage} 
      user={user}
    />
  );
}