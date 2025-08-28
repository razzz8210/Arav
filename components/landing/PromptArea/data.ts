export type TabConfigGoTo =
  | "product-builder"
  | "avatars"
  | "reels"
  | "carousel"
  | "all";

export interface TabConfig {
  id: string;
  icon: string;
  title: string;
  image: string;
  key: string;
  placeholder: string;
  goTo: TabConfigGoTo;
  subtitle: string;
}

export const tabs: TabConfig[] = [
  {
    id: "website",
    icon: "i-ph:code",
    title: "Website",
    image: "/landing/hero-section/web_light.webm",
    key: "website",
    placeholder: "Create a Web App for my Dog Walking Business.",
    goTo: "product-builder",
    subtitle: "Build Your Website.",
  },
  {
    id: "avatars",
    icon: "i-ph:user",
    title: "Avatars",
    image: "/landing/hero-section/avatars.webm",
    key: "avatars",
    placeholder: "Generate an avatar that is professional and enthusiastic.",
    goTo: "avatars",
    subtitle: "Create your Avatar.",
  },
  {
    id: "reels",
    icon: "i-ph:video",
    title: "Reels",
    image: "/landing/hero-section/reels.webm",
    key: "reels",
    placeholder: "Create reels to market my Dog walking Service.",
    goTo: "reels",
    subtitle: "Craft Reels.",
  },
  {
    id: "carousel",
    icon: "i-ph:image",
    title: "Carousel",
    image: "/landing/hero-section/assets.webm",
    key: "carousel",
    placeholder: "Generate marketing ads for my dog walking service.",
    goTo: "carousel",
    subtitle: "Generate Carousel.",
  },
  {
    id: "all",
    icon: "i-ph:robot",
    title: "All",
    image: "/landing/hero-section/all.webm",
    key: "all",
    placeholder: "Generate marketing ads for my dog walking service...",
    goTo: "all",
    subtitle: "Fully Launched.",
  },
];

export const getLoaderMessage = (tabId: string): string => {
  switch (tabId) {
    case "website":
      return "Building your Website";
    case "reels":
      return "Crafting your Reels";
    case "avatars":
      return "Customizing your Avatar";
    case "carousel":
      return "Creating your Carousal";
    case "all":
      return "Generating your Content";
    default:
      return "Loading...";
  }
};
