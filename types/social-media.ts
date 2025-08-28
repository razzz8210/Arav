export interface SocialMediaPostResponse {
  post_id: string;
  user_id: string;
  post_text: string;
  links: string[];
  type: "video" | "image";
  platform: string;
  schedule_date: string;
  status_field: "draft" | "published" | "scheduled";
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaPost {
  id: string;
  thumbnail: string;
  links: string[];
  title: string;
  caption: string;
  type: "Image" | "Reel";
  platform: string;
  scheduleDate: string;
  status: "Scheduled" | "Published" | "Draft";
}
