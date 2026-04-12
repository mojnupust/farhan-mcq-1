import { apiSubscriptionService } from "./services/subscription.api";
import type { SubscriptionService } from "./services/subscription.service";

export const subscriptionService: SubscriptionService = apiSubscriptionService;

export {
  SubscriptionProvider,
  useSubscription,
} from "./components/subscription-provider";
export * from "./schemas";
export type { SubscriptionService } from "./services/subscription.service";
export * from "./types";
