import { AuthProvider } from "@/features/auth";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
