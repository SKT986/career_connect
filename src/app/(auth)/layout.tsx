import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center justify-center text-lg">
          <Logo />
        </Link>
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
