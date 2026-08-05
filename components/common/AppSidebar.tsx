// components/common/AppSidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LogOut, 
  Users, 
  FileText, 
  Building2, 
  Calendar,
  Shield
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
// import { logoutAction } from "@/app/actions/auth.actions";
import type { User as UserType } from "@/types/api";

const menuItems = [
  { title: "Empleados", icon: Users, href: "/empleados" },
  { title: "Solicitudes", icon: FileText, href: "/solicitudes" },
  { title: "Departamentos", icon: Building2, href: "/departamentos" },
  { title: "Calendario", icon: Calendar, href: "/calendario" },
];

interface AppSidebarProps {
  user?: UserType;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      // await logoutAction();
      router.push("/login");
    });
  };

  // Función para verificar si la ruta está activa
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <Sidebar variant="inset" className="border-r border-border">
      <SidebarHeader className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-lg font-semibold">Bajalta</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  // Usar render en lugar de asChild para Base UI
                  render={
                    <Link 
                      href={item.href} 
                      className="flex items-center gap-3 px-3 py-2 w-full"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  }
                  // Clase condicional para el estado activo
                  className={cn(
                    "w-full",
                    active && "bg-primary/10 text-primary"
                  )}
                  // tooltip={item.title} // Comentado porque puede interferir con render
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border px-2 py-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user?.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.full_name || "Usuario"}
            </p>
            <div className="flex items-center gap-1">
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "usuario@email.com"}
              </p>
              {user?.is_admin && (
                <Shield className="h-3 w-3 text-primary shrink-0" />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Cerrar sesión"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {isLoggingOut ? (
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}