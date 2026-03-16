import { BrandedAuthLayout } from "@/components/auth/branded-auth-layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BrandedAuthLayout>{children}</BrandedAuthLayout>;
}
