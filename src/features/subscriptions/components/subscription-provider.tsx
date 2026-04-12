"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiSubscriptionService as subscriptionService } from "../services/subscription.api";
import type { UserPackageDto } from "../types";

interface SubscriptionContextType {
  activePackage: UserPackageDto | null;
  isLoading: boolean;
  /** Whether the subscription is currently valid (active + not expired) */
  hasActiveSubscription: boolean;
  /** Remaining live quota, null if unlimited */
  liveRemaining: number | null;
  /** Remaining archive quota, null if unlimited */
  archiveRemaining: number | null;
  /** Re-fetch subscription data (e.g. after a payment) */
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [activePackage, setActivePackage] = useState<UserPackageDto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchPackage = useCallback(async () => {
    try {
      const pkg = await subscriptionService.getMyPackage();
      setActivePackage(pkg);
    } catch (err) {
      console.error("Failed to load subscription:", err);
      setActivePackage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  const hasActiveSubscription = activePackage?.isActive === true;

  const liveRemaining =
    activePackage?.packageLiveQuota != null
      ? activePackage.packageLiveQuota - activePackage.liveUsed
      : null;

  const archiveRemaining =
    activePackage?.packageArchiveQuota != null
      ? activePackage.packageArchiveQuota - activePackage.archiveUsed
      : null;

  return (
    <SubscriptionContext.Provider
      value={{
        activePackage,
        isLoading,
        hasActiveSubscription,
        liveRemaining,
        archiveRemaining,
        refresh: fetchPackage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}
