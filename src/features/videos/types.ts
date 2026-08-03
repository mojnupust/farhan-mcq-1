export type VideoCategory =
  | "BCS"
  | "PRIMARY"
  | "BANK"
  | "SCHOOL"
  | "COLLEGE"
  | "NTRCA"
  | "SOMAJSEBA"
  | "COMPUTER_OPERATOR"
  | "POLICE"
  | "DEFENCE"
  | "RAILWAY"
  | "HEALTH"
  | "OTHER";

export type VideoSort = "newest" | "popular" | "most_liked";

export interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl: string | null;
  category: VideoCategory;
  tags: string[];
  durationSec: number | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isFeatured: boolean;
  isActive: boolean;
  publishedAt: string | null;
  channelVideoId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  likedByMe?: boolean;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoFilter {
  category?: VideoCategory;
  search?: string;
  sort?: VideoSort;
  featured?: boolean;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedVideos {
  data: Video[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedVideoComments {
  data: VideoComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVideoInput {
  title: string;
  description?: string;
  youtubeUrl: string;
  category?: VideoCategory;
  tags?: string[];
  durationSec?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  publishedAt?: string;
}

export type UpdateVideoInput = Partial<CreateVideoInput>;

export interface ParsedYoutubeUrl {
  youtubeVideoId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  embedUrl: string;
}

export interface ToggleLikeResult {
  liked: boolean;
  likeCount: number;
}
