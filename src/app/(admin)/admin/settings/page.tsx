import { ChevronRight, Info, KeyRound } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// TODO: replace with real auth session
export default async function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure site-wide settings
        </p>
      </div>

      {/* Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            System Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage key configurations and integrations for the platform.
          </p>
        </div>

        {/* AI API Keys */}
        <Link
          href="/admin/settings/ai-keys"
          className="group flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">
              AI API Key Management
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add, view and manage API keys for AI providers
            </p>
          </div>

          <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
        </Link>

        {/* About */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h3 className="font-semibold text-slate-900">About</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Configure integrations and system preferences that power AI
                features across the platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
