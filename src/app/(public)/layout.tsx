import { AuthProvider } from "@/features/auth";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" closeButton />
      {children}
    </AuthProvider>
  );
}
