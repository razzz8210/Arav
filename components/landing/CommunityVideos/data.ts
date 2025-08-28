export interface ImageItem {
  id: string;
  imageUrl: string;
  title: string;
  postType: "Creative Post" | "Landing Page" | "Creative Reel";
}

export const communityImages: ImageItem[] = [
  {
    id: "1",
    imageUrl: "/landing/community-videos/image-1.webp",
    title: "Glow from the Inside Out with LUKE",
    postType: "Creative Post",
  },
  {
    id: "2",
    imageUrl: "/landing/community-videos/image-2.webp",
    title: "Find Your Perfect Home",
    postType: "Landing Page",
  },
  {
    id: "3",
    imageUrl: "/landing/community-videos/image-3.webp",
    title: "Behind the Scenes",
    postType: "Creative Reel",
  },
  {
    id: "4",
    imageUrl: "/landing/community-videos/image-4.webp",
    title: "Live with Style",
    postType: "Creative Post",
  },
  {
    id: "5",
    imageUrl: "/landing/community-videos/image-5.webp",
    title: "My Fitness Journey",
    postType: "Creative Post",
  },
  {
    id: "6",
    imageUrl: "/landing/community-videos/image-6.webp",
    title: "Gaming Experience",
    postType: "Creative Reel",
  },
  {
    id: "7",
    imageUrl: "/landing/community-videos/image-7.webp",
    title: "Peak Performance",
    postType: "Creative Reel",
  },
  {
    id: "8",
    imageUrl: "/landing/community-videos/image-8.webp",
    title: "Createra Brand",
    postType: "Creative Reel",
  },
  {
    id: "9",
    imageUrl: "/landing/community-videos/image-9.webp",
    title: "Beach Vibes",
    postType: "Creative Reel",
  },
  {
    id: "10",
    imageUrl: "/landing/community-videos/image-10.webp",
    title: "Pawfect Match",
    postType: "Creative Post",
  },
  {
    id: "11",
    imageUrl: "/landing/community-videos/image-11.webp",
    title: "PowerSurge Collection",
    postType: "Creative Post",
  },
  {
    id: "12",
    imageUrl: "/landing/community-videos/image-12.webp",
    title: "Creative Portfolio",
    postType: "Creative Reel",
  },
];

// Utility function for getting post type colors
export const getPostTypeColor = (postType: string): string => {
  switch (postType) {
    case "Creative Post":
      return "#FF6B35";
    case "Landing Page":
      return "#8B5CF6";
    case "Creative Reel":
      return "#06B6D4";
    default:
      return "#FF6B35";
  }
};
