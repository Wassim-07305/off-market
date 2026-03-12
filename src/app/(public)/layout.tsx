// Public layout — no authentication, no sidebar, minimal wrapper
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
