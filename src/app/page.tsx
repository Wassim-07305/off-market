import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "./(marketing)/page";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";

    switch (role) {
      case "admin":
        redirect("/admin/dashboard");
      case "coach":
        redirect("/coach/dashboard");
      case "setter":
      case "closer":
        redirect("/sales/dashboard");
      case "client":
      default:
        redirect("/client/dashboard");
    }
  }

  return <LandingPage />;
}
