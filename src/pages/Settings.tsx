import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileSection from "@/components/settings/ProfileSection";
import SecuritySection from "@/components/settings/SecuritySection";
import SubscriptionSection from "@/components/settings/SubscriptionSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import PrivacySection from "@/components/settings/PrivacySection";
import { useAuth } from "@/store/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMobile } from "@/hooks/useMobile";

import {
  useSubscriptionStatus,
  usePreferences,
  useNotifications,
  useBillingPortal,
  useDataExport,
  useDeleteAccount,
} from "@/hooks/useSettings";
import { usePrefs } from "@/store/usePrefs";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function Settings() {
  const { profile: authProfile } = useAuth();
  const isMobile = useIsMobile();

  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const { data: preferences, save: savePrefs, isLoading: preferencesLoading, isSuccess } = usePreferences();
  const { data: notifications, save: saveNotifs, isLoading: notificationsLoading } = useNotifications();
  const { open: billingPortal } = useBillingPortal();
  const { exportZip } = useDataExport();
  const { del: deleteAccount } = useDeleteAccount();

  const { theme, currency, timezone, setTheme, setCurrency, setTimezone, loadFromBackend } = usePrefs();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: authProfile?.full_name || "",
      email: authProfile?.email || "",
    },
  });

  // Keep the form in sync with the authenticated profile
  useEffect(() => {
    if (authProfile) {
      form.reset({
        full_name: authProfile.full_name || "",
        email: authProfile.email,
      });
    }
  }, [authProfile, form]);

  /**
   * Sync preferences from backend -> UI store exactly once per payload.
   * Without the guard, React Query re-renders (or route hops) can
   * re-apply and cause flicker / loops.
   */
  const lastAppliedPrefs = useRef<string | null>(null);
  const prefsKey = useMemo(
    () => (preferences ? JSON.stringify(preferences) : null),
    [preferences]
  );

  useEffect(() => {
    if (isSuccess && preferences && prefsKey && lastAppliedPrefs.current !== prefsKey) {
      loadFromBackend(preferences);
      lastAppliedPrefs.current = prefsKey;
    }
  }, [isSuccess, preferences, prefsKey, loadFromBackend]);

  if (!authProfile) {
    return (
      <div className={`mx-auto space-y-6 ${isMobile ? "p-4" : "max-w-5xl p-4 md:p-8"}`}>
        <div>
          <h1 className={`font-semibold tracking-tight ${isMobile ? "text-xl" : "text-2xl"}`}>Settings</h1>
          <p className="text-sm text-muted-foreground">Loading your settings...</p>
        </div>
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 ${isMobile ? "p-4" : "max-w-5xl p-4 md:p-8"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-semibold tracking-tight ${isMobile ? "text-xl" : "text-2xl"}`}>Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, billing, preferences, and privacy.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {isMobile ? (
          <TabsList className="grid grid-cols-3 gap-1 w-full mb-6">
            <TabsTrigger value="profile" className="text-xs px-2 py-2">Profile</TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-2 py-2">Security</TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs px-2 py-2">Subscription</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs px-2 py-2">Preferences</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-2 py-2">Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs px-2 py-2">Privacy</TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Data &amp; Privacy</TabsTrigger>
          </TabsList>
        )}

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <ProfileSection
            form={form}
            onSave={(values) => {
              console.log("Profile update attempted:", values);
              toast.success("Profile updated (simulated)");
            }}
            saving={false}
          />
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <SecuritySection
            onToggle2FA={(v) => toast.info(v ? "2FA enabled (mock)" : "2FA disabled (mock)")}
            onChangePassword={() => toast.success("Password updated (mock)")}
          />
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription" className="space-y-6 mt-6">
          {subscriptionLoading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <SubscriptionSection
              isPro={subscription?.is_pro}
              status={subscription?.status}
              currentPeriodEnd={subscription?.current_period_end}
              planName={subscription?.plan_name}
              cancelAtPeriodEnd={subscription?.cancel_at_period_end}
              onManageBilling={() =>
                billingPortal.mutate(undefined, {
                  onSuccess: (url) => (window.location.href = url),
                  onError: (e: any) => toast.error(e?.message ?? "Failed to open billing portal"),
                })
              }
              manageLoading={billingPortal.isPending}
            />
          )}
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          {preferencesLoading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <PreferencesSection
              theme={theme}
              currency={currency}
              timezone={timezone}
              onTheme={(v) => {
                setTheme(v as any);
                savePrefs.mutate(
                  { theme: v, currency, timezone },
                  {
                    onSuccess: () => toast.success(`Theme updated to ${v}`),
                    onError: (e: any) => toast.error(e?.message ?? "Failed to save theme preference"),
                  }
                );
              }}
              onCurrency={(v) => {
                setCurrency(v);
                savePrefs.mutate(
                  { theme, currency: v, timezone },
                  {
                    onSuccess: () => toast.success(`Currency updated to ${v}`),
                    onError: (e: any) => toast.error(e?.message ?? "Failed to save currency preference"),
                  }
                );
              }}
              onTimezone={(v) => {
                setTimezone(v);
                savePrefs.mutate(
                  { theme, currency, timezone: v },
                  {
                    onSuccess: () => toast.success(`Timezone updated to ${v}`),
                    onError: (e: any) => toast.error(e?.message ?? "Failed to save timezone preference"),
                  }
                );
              }}
            />
          )}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          {notificationsLoading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <NotificationsSection
              emailWeekly={notifications?.emailWeekly ?? true}
              inAppAlerts={notifications?.inAppAlerts ?? true}
              onChange={(vals) => {
                saveNotifs.mutate(vals, {
                  onSuccess: () => toast.success("Notification preferences saved"),
                  onError: (e: any) => toast.error(e?.message ?? "Failed to save notification preferences"),
                });
              }}
            />
          )}
        </TabsContent>

        {/* Data & Privacy */}
        <TabsContent value="privacy" className="space-y-6 mt-6">
          <PrivacySection
            exporting={exportZip.isPending}
            deleting={deleteAccount.isPending}
            onExport={() =>
              exportZip.mutate(undefined, {
                onSuccess: () => toast.success("Export ready"),
                onError: (e: any) => toast.error(e?.message ?? "Export failed"),
              })
            }
            onDelete={() => {
              if (confirm("This will permanently delete your account and data. Continue?")) {
                deleteAccount.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Account deleted");
                    window.location.href = "/login";
                  },
                  onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
                });
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
