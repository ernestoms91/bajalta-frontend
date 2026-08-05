// components/common/MobileNavbar.tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function MobileNavbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
      <SidebarTrigger>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SidebarTrigger>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Bajalta</h1>
      </div>
    </header>
  );
}