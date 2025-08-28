export const extractAvatarData = (data: any) => {
  const videoLinks = data.video_links || [];
  const fileNames = data.file_names || [];
  const createdAt = data.created_ats || [];

  const avatars = videoLinks.map((fileUrl: string, idx: number) => ({
    urls: [fileUrl],
    fileName: fileNames[idx] || "",
    createdAt: parseFloat(createdAt[idx]) ?? 0,
    type: "avatar",
    taskStatus: "",
  }));

  return avatars;
};

export const extractReelData = (data: any) => {
  return data.hook_demos.map((reel: any) => ({
    urls: reel.hook_demo_links,
    fileName: reel.file_name,
    createdAt: parseFloat(reel.created_at) ?? 0,
    type: "reel",
    taskStatus: reel.task_status,
  }));
};

export const extractCarouselData = (data: any) => {
  if (!data.slideshows) return [];
  
  return data.slideshows.map((carousel: any) => ({
    urls: carousel.slideshow_links || [],
    fileName: carousel.file_name,
    createdAt: (parseFloat(carousel.created_at) || 0) * 1000, // Convert to milliseconds
    type: "slideshow", // Changed from "carousel" to "slideshow"
    taskStatus: carousel.task_status,
  }));
};
