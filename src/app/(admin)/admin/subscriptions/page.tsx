import { subscriptionService } from "@/features/subscriptions";
import { AdminSubscriptionTable } from "@/features/subscriptions/components/admin/admin-subscription-table";
import type { PaymentTransactionDto } from "@/features/subscriptions/types";
import type {
  AdminTransaction,
  PaymentMethod,
  TransactionStatus,
} from "@/types";

export const dynamic = "force-dynamic";

const statusMap: Record<PaymentTransactionDto["status"], TransactionStatus> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "declined",
};

function toAdminTransaction(dto: PaymentTransactionDto): AdminTransaction {
  return {
    id: dto.id,
    transactionId: dto.transactionId,
    amount: dto.amount,
    method: dto.paymentMethod as PaymentMethod,
    date: dto.createdAt,
    status: statusMap[dto.status],
    adminComment: dto.adminNote ?? undefined,
    createdAt: dto.createdAt,
    memberId: dto.userId,
    memberName: dto.userName ?? "Unknown",
    memberEmail: dto.userMobile ?? "",
  };
}

export default async function AdminSubscriptionsPage() {
  const raw = await subscriptionService.getAllTransactions();
  const transactions = raw.map(toAdminTransaction);
  const pendingCount = transactions.filter(
    (t) => t.status === "pending",
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          {transactions.length} total transactions · {pendingCount} pending
          review
        </p>
      </div>
      <AdminSubscriptionTable transactions={transactions} />
    </div>
  );
}
