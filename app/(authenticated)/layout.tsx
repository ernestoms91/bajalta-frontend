// app/(authenticated)/layout.tsx
import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileNavbar } from "@/components/common/MobileNavbar";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user.action";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userResponse = await getCurrentUser();
  
  if (!userResponse.success || !userResponse.data) {
    redirect("/");
  }

  const user = userResponse.data;

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar user={user} />

      <div className="flex flex-1 flex-col">
        <MobileNavbar />
        <main className="flex-1 p-4 pt-6 md:pt-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}