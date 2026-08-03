import type { VideoService } from "./video.service";

const mockVideo = {
  id: "mock-video-1",
  title: "বিসিএস প্রিলি — বাংলা ব্যাকরণ সংক্ষিপ্ত আলোচনা",
  description: "Farhan MCQ থেকে নমুনা ভিডিও লেকচার।",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  youtubeVideoId: "dQw4w9WgXcQ",
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  category: "BCS" as const,
  tags: ["বাংলা", "প্রিলি"],
  durationSec: 1240,
  viewCount: 1250,
  likeCount: 89,
  commentCount: 12,
  isFeatured: true,
  isActive: true,
  publishedAt: new Date().toISOString(),
  channelVideoId: "dQw4w9WgXcQ",
  createdBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockVideoService: VideoService = {
  async getAll() {
    return {
      data: [mockVideo],
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
  },
  async getFeatured() {
    return [mockVideo];
  },
  async getById() {
    return mockVideo;
  },
  async recordView() {},
  async toggleLike() {
    return { liked: true, likeCount: mockVideo.likeCount + 1 };
  },
  async getComments() {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async addComment(_id, content) {
    return {
      id: "c1",
      videoId: mockVideo.id,
      userId: "u1",
      userName: "ব্যবহারকারী",
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  async deleteComment() {},
  async adminGetAll() {
    return {
      data: [mockVideo],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },
  async adminParseYoutube(url) {
    return {
      youtubeVideoId: "dQw4w9WgXcQ",
      youtubeUrl: url,
      thumbnailUrl: mockVideo.thumbnailUrl!,
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    };
  },
  async adminCreate(input) {
    return { ...mockVideo, ...input, id: "new-" + Date.now() };
  },
  async adminUpdate(_id, input) {
    return { ...mockVideo, ...input };
  },
  async adminDelete() {},
  async adminStats() {
    return { total: 1 };
  },
};
