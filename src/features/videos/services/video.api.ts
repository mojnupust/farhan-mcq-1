import { apiClient } from "@/lib/api-client";

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
import type { VideoService } from "./video.service";

function buildParams(filter?: VideoFilter): string {
  if (!filter) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : "";
}

export const apiVideoService: VideoService = {
  async getAll(filter) {
    return apiClient.get<PaginatedVideos>(`/v1/videos${buildParams(filter)}`);
  },

  async getFeatured() {
    const res = await apiClient.get<{ data: Video[] }>("/v1/videos/featured");
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get<{ data: Video }>(`/v1/videos/${id}`);
    return res.data;
  },

  async recordView(id) {
    await apiClient.post(`/v1/videos/${id}/view`, {});
  },

  async toggleLike(id) {
    const res = await apiClient.post<{ data: ToggleLikeResult }>(
      `/v1/videos/${id}/like`,
      {},
    );
    return res.data;
  },

  async getComments(id, page = 1, limit = 20) {
    return apiClient.get<PaginatedVideoComments>(
      `/v1/videos/${id}/comments?page=${page}&limit=${limit}`,
    );
  },

  async addComment(id, content) {
    const res = await apiClient.post<{ data: VideoComment }>(
      `/v1/videos/${id}/comments`,
      { content },
    );
    return res.data;
  },

  async deleteComment(videoId, commentId) {
    await apiClient.delete(`/v1/videos/${videoId}/comments/${commentId}`);
  },

  async adminGetAll(filter) {
    return apiClient.get<PaginatedVideos>(
      `/v1/videos/admin/list${buildParams(filter)}`,
    );
  },

  async adminParseYoutube(url) {
    const res = await apiClient.post<{ data: ParsedYoutubeUrl }>(
      "/v1/videos/admin/parse-youtube",
      { url },
    );
    return res.data;
  },

  async adminCreate(input) {
    const res = await apiClient.post<{ data: Video }>("/v1/videos/admin", input);
    return res.data;
  },

  async adminUpdate(id, input) {
    const res = await apiClient.patch<{ data: Video }>(
      `/v1/videos/admin/${id}`,
      input,
    );
    return res.data;
  },

  async adminDelete(id) {
    await apiClient.delete(`/v1/videos/admin/${id}`);
  },

  async adminStats() {
    const res = await apiClient.get<{ data: { total: number } }>(
      "/v1/videos/admin/stats",
    );
    return res.data;
  },
};
