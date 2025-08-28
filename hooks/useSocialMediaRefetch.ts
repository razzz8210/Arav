import { useState, useEffect, useCallback } from "react";
import { SocialMediaPost, SocialMediaPostResponse } from "@/types/social-media";

// Function to process API data into display format
const processPostData = (apiPost: SocialMediaPostResponse): SocialMediaPost => {
  return {
    id: apiPost.post_id,
    thumbnail: apiPost.links?.[0] ?? "",
    links: apiPost.links || [],
    title:
      apiPost.post_text.length > 50
        ? apiPost.post_text.substring(0, 50) + "..."
        : apiPost.post_text,
    caption: apiPost.post_text,
    type: apiPost.type === "video" ? "Reel" : "Image",
    platform: apiPost.platform,
    scheduleDate: apiPost.schedule_date,
    status: (apiPost.status_field.charAt(0).toUpperCase() +
      apiPost.status_field.slice(1)) as "Scheduled" | "Published" | "Draft",
  };
};

// Global event emitter for refetch events
class SocialMediaEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach((listener) => listener());
  }
}

const socialMediaEventEmitter = new SocialMediaEventEmitter();

export const useSocialMediaRefetch = (projectId: string) => {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/get-draft-posts?projectId=${projectId}`
      );
      const result = await response.json();

      if (result.success && result.data?.posts) {
        const processedPosts = result.data.posts.map(
          (post: SocialMediaPostResponse) => processPostData(post)
        );
        setPosts(processedPosts);
      } else {
        setError(result.error ? result.error : "Failed to fetch posts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refetch = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Global refetch function that can be called from anywhere
  const triggerRefetch = useCallback(() => {
    socialMediaEventEmitter.emit();
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPosts();

    // Subscribe to global refetch events
    const unsubscribe = socialMediaEventEmitter.subscribe(() => {
      fetchPosts();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch,
    triggerRefetch,
  };
};

// Export the global refetch trigger function
export const triggerSocialMediaRefetch = () => {
  socialMediaEventEmitter.emit();
};
