export type ContentType = "document" | "blog";

export type PublishStatus = "draft" | "published";

export type ContentLocale = "sr" | "en" | "ru";

export type LocalizedContentFields = {
  title: string;
  body: string;
  excerpt: string;
  categories: string[];
};

export type DocumentAttachment = {
  id: string;
  name: string;
  fileUrl: string;
  fileType: "pdf" | "docx";
  fileSize?: string;
  uploadedAt?: string;
};

export type BaseContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  coverImage?: string;
  body: string;
  excerpt: string;
  categories: string[];
  author: string;
  createdAt: string;
  updatedAt?: string;
  publishStatus: PublishStatus;
  featured?: boolean;
  readingTime?: number;
  attachments?: DocumentAttachment[];
  locales: Record<ContentLocale, LocalizedContentFields>;
};

export type ContentSortOption = "newest" | "oldest" | "shortest-read" | "longest-read";
