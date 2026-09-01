import { BrandLogo } from "@/components/brand-logo";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <BrandLogo iconClassName="size-8" titleClassName="text-sm" />
          <p className="text-xs text-muted-foreground">
            © 2026 Farhan Software. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/profile.php?id=61574369463384"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Facebook
          </a>
          <a
            href="https://wa.me/8801788262433"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
