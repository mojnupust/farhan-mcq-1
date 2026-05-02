import type {
  PackageDto,
  PaymentTransactionDto,
  UserPackageDto,
  UserProfileDto,
} from "../types";
import type { SubscriptionService } from "./subscription.service";

const mockPackages: PackageDto[] = [
  {
    id: "pkg1",
    name: "১ বছর প্যাকেজ",
    durationDays: 365,
    price: 500,
    discount: 50,
    description: "১ বছরের জন্য সকল পরীক্ষায় অংশ নেওয়া যাবে",
    liveQuota: null,
    archiveQuota: null,
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const mockTransactions: PaymentTransactionDto[] = [];

export const mockSubscriptionService: SubscriptionService = {
  async getPackages() {
    return mockPackages;
  },
  async submitPayment(data) {
    const txn: PaymentTransactionDto = {
      id: String(Date.now()),
      userId: "mock-user",
      ...data,
      status: "PENDING",
      adminNote: null,
      reviewedAt: null,
      reviewedBy: null,
      createdAt: new Date().toISOString(),
      packageName: "Mock Package",
      userName: "Mock User",
      userMobile: data.mobileNumber,
    };
    mockTransactions.push(txn);
    return txn;
  },
  async getMyTransactions() {
    return mockTransactions;
  },
  async deleteTransaction(id) {
    const idx = mockTransactions.findIndex((t) => t.id === id);
    if (idx !== -1) mockTransactions.splice(idx, 1);
  },
  async getMyPackage(): Promise<UserPackageDto | null> {
    return null;
  },
  async getProfile(): Promise<UserProfileDto> {
    return {
      id: "mock-user",
      mobile: "01700000001",
      name: "Mock User",
      photo: null,
      role: "USER",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      activePackage: null,
    };
  },
  async updateProfile(data) {
    return {
      id: "mock-user",
      mobile: "01700000001",
      name: data.name ?? "Mock User",
      photo: data.photo ?? null,
      role: "USER",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      activePackage: null,
    };
  },
  async getAdminPackages() {
    return mockPackages;
  },
  async createPackage(data) {
    const pkg: PackageDto = {
      id: String(Date.now()),
      ...data,
      discount: data.discount ?? 0,
      description: data.description ?? null,
      liveQuota: data.liveQuota ?? null,
      archiveQuota: data.archiveQuota ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockPackages.push(pkg);
    return pkg;
  },
  async updatePackage(id, data) {
    const pkg = mockPackages.find((p) => p.id === id);
    if (!pkg) throw new Error("Not found");
    Object.assign(pkg, data);
    return pkg;
  },
  async deletePackage(id) {
    const idx = mockPackages.findIndex((p) => p.id === id);
    if (idx !== -1) mockPackages.splice(idx, 1);
  },
  async getAllTransactions() {
    return mockTransactions;
  },
  async approveTransaction(id, data) {
    const txn = mockTransactions.find((t) => t.id === id);
    if (!txn) throw new Error("Not found");
    txn.status = "APPROVED";
    if (data.adminNote) txn.adminNote = data.adminNote;
    return txn;
  },
  async rejectTransaction(id, data) {
    const txn = mockTransactions.find((t) => t.id === id);
    if (!txn) throw new Error("Not found");
    txn.status = "REJECTED";
    if (data.adminNote) txn.adminNote = data.adminNote;
    return txn;
  },
  async bulkUpsertPackages(items) {
    return items.map((item, i) => ({
      id: item.id ?? String(Date.now() + i),
      name: item.name,
      durationDays: item.durationDays,
      price: item.price,
      discount: item.discount ?? 0,
      description: item.description ?? null,
      liveQuota: item.liveQuota ?? null,
      archiveQuota: item.archiveQuota ?? null,
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
      createdAt: new Date().toISOString(),
    }));
  },
  async bulkDeletePackages() {
    // no-op
  },
};
