export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute -top-1/2 -left-1/3 w-[80%] h-[80%] rounded-full blur-[120px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-1/3 -right-1/4 w-[60%] h-[60%] rounded-full blur-[100px] opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[40%] h-[40%] rounded-full blur-[80px] opacity-10"
          style={{
            background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite 2s",
          }}
        />
      </div>
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative w-full max-w-[420px] z-10">{children}</div>
    </div>
  );
}
