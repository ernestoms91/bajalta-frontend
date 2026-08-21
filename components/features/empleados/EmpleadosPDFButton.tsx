// components/features/empleados/EmpleadosPDFButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadReporteActivosPDF } from "@/app/actions/empleado.actions";

export function EmpleadosPDFButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await downloadReporteActivosPDF();

      if (!result.success || !result.blob) {
        toast.error(result.error || "Error al generar el reporte");
        return;
      }

      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.download = `reporte_activos_${date}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Reporte PDF descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-2"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {loading ? "Generando..." : "Reporte PDF"}
    </Button>
  );
}