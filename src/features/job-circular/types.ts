export type OrgType = "GOVERNMENT" | "PRIVATE" | "AUTONOMOUS" | "NGO";
export type CircularStatus = "LIVE" | "UPCOMING" | "EXPIRED";

export interface JobCircular {
  id: string;
  gjobId: string | null;
  organizationName: string;
  organizationSlug: string;
  orgType: OrgType;
  logoUrl: string | null;
  title: string;
  totalPosts: number;
  applicationUrl: string | null;
  publishDate: string | null;
  deadline: string | null;
  examDate: string | null;
  description: string | null;
  eligibility: string | null;
  salary: string | null;
  experience: string | null;
  location: string | null;
  source: string | null;
  category: string | null;
  ministry: string | null;
  status: CircularStatus;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedJobCirculars {
  data: JobCircular[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobCircularFilter {
  orgType?: OrgType;
  status?: CircularStatus;
  category?: string;
  ministry?: string;
  search?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  page?: number;
  limit?: number;
}

export interface JobCircularFilterOptions {
  categories: string[];
  ministries: string[];
  organizations: { name: string; slug: string }[];
}

export interface CreateJobCircularInput {
  gjobId?: string;
  organizationName: string;
  organizationSlug: string;
  orgType?: OrgType;
  logoUrl?: string;
  title: string;
  totalPosts?: number;
  applicationUrl?: string;
  publishDate?: string;
  deadline?: string;
  examDate?: string;
  description?: string;
  eligibility?: string;
  salary?: string;
  experience?: string;
  location?: string;
  source?: string;
  category?: string;
  ministry?: string;
  status?: CircularStatus;
}

export interface UpdateJobCircularInput extends Partial<CreateJobCircularInput> {
  isActive?: boolean;
}
