import { FreeTierSettings } from "@/features/question-sets/components/free-tier-settings";
import { settingsService } from "@/features/settings";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const dynamic = "force-dynamic";

// TODO: replace with real auth session
export default async function AdminSettingsPage() {
  const settings = await settingsService.getSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure site-wide settings
        </p>
      </div>
      <SettingsForm settings={settings} />
      <FreeTierSettings />
    </div>
  );
}
