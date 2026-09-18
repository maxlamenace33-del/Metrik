import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/shared/app-header";
import { MobileNav } from "@/components/shared/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupération des informations de profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader userEmail={user.email} fullName={profile?.full_name} />
      <main className="flex-1 pb-20 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
