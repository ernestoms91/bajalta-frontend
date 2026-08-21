// app/actions/empleados.actions.ts
"use server";

import { fetchWithAuth, fetchWithAuthBlob } from "@/lib/fetch-utils";
import { ActionResponse, Empleado, EmpleadosResponse } from "@/types/api";

export async function getAllEmpleados(
    page: number = 1,
    size: number = 10
): Promise<ActionResponse<EmpleadosResponse>> {
    const url = `/empleados/?page=${page}&size=${size}`;

    // await new Promise(resolve => setTimeout(resolve, 2000));
    const response = await fetchWithAuth<EmpleadosResponse>(url, {
        method: "GET",
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al obtener empleados",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}

export async function getEmpleadosPendientesBaja(
    page: number = 1,
    size: number = 10
): Promise<ActionResponse<EmpleadosResponse>> {
    const url = `/empleados/pendientes-baja?page=${page}&size=${size}`;

    const response = await fetchWithAuth<EmpleadosResponse>(url, {
        method: "GET",
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al obtener empleados pendientes de baja",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}

export async function createEmpleado(
    payload: {
        nombre: string;
        apellidos: string;
        ci: string;
        telefono?: string;
        email?: string;
        departamento: string;
        observaciones?: string;
    }
): Promise<ActionResponse<Empleado>> {
    const response = await fetchWithAuth<Empleado>("/empleados/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al crear el empleado",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}

export async function darBajaEmpleado(
    id: number,
    motivo: string,
    urgente: boolean = false
): Promise<ActionResponse<Empleado>> {
    const response = await fetchWithAuth<Empleado>(`/empleados/${id}/baja`, {
        method: "PUT",
        body: JSON.stringify({ motivo, urgente }),
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al solicitar la baja del empleado",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}

export async function updateEmpleado(
    id: number,
    payload: {
        nombre?: string;
        apellidos?: string;
        ci?: string;
        telefono?: string;
        email?: string;
        departamento?: string;
        observaciones?: string;
        estado?: "ACTIVO" | "PENDIENTE_BAJA" | "DADO_BAJA";
    }
): Promise<ActionResponse<Empleado>> {
    const response = await fetchWithAuth<Empleado>(`/empleados/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al actualizar el empleado",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}

export async function downloadReporteActivosPDF(): Promise<{ success: boolean; error?: string; blob?: Blob }> {
    const response = await fetchWithAuthBlob("/empleados/reporte/activos/pdf", {
        method: "GET",
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al generar el reporte PDF",
        };
    }

    return {
        success: true,
        blob: response.data,
    };
}

export async function activarEmpleado(
    id: number
): Promise<ActionResponse<Empleado>> {
    const response = await fetchWithAuth<Empleado>(`/empleados/${id}/activar`, {
        method: "PUT",
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al activar el empleado",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}

export async function completarBajaEmpleado(
    id: number
): Promise<ActionResponse<Empleado>> {
    const response = await fetchWithAuth<Empleado>(`/empleados/${id}/completar-baja`, {
        method: "PUT",
    });

    if (!response.success || !response.data) {
        return {
            success: false,
            error: response.error || "Error al completar la baja del empleado",
            data: undefined,
        };
    }

    return {
        success: true,
        data: response.data,
    };
}