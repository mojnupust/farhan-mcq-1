import type {
  CreateVideoInput,
  PaginatedVideoComments,
  PaginatedVideos,
  ParsedYoutubeUrl,
  ToggleLikeResult,
  UpdateVideoInput,
  Video,
  VideoComment,
  VideoFilter,
} from "../types";

export interface VideoService {
  getAll(filter?: VideoFilter): Promise<PaginatedVideos>;
  getFeatured(): Promise<Video[]>;
  getById(id: string): Promise<Video>;
  recordView(id: string): Promise<void>;
  toggleLike(id: string): Promise<ToggleLikeResult>;
  getComments(id: string, page?: number, limit?: number): Promise<PaginatedVideoComments>;
  addComment(id: string, content: string): Promise<VideoComment>;
  deleteComment(videoId: string, commentId: string): Promise<void>;
  adminGetAll(filter?: VideoFilter): Promise<PaginatedVideos>;
  adminParseYoutube(url: string): Promise<ParsedYoutubeUrl>;
  adminCreate(input: CreateVideoInput): Promise<Video>;
  adminUpdate(id: string, input: UpdateVideoInput): Promise<Video>;
  adminDelete(id: string): Promise<void>;
  adminStats(): Promise<{ total: number }>;
}
