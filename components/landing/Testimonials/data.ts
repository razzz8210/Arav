import { Testimonial } from "@/types/testimonials";

const content: string[] = [
  "Our agency now offers rapid web app mockups for clients—and they love it. This platform is an essential part of our workflow.",
  "I launched 3 apps with Cracked in a weekend — and they got actual users.",
  "Feels like having a dev, designer, and marketer in one tool",
  "Cracked allowed me to prototype my ideas faster than ever before, streamlining feedback from clients.",
];

export const testimonials: Testimonial[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: index + 1,
    content: content[index % content.length],
    author: {
      name: `Beta Tester ${index + 1}`,
      role: "Beta Tester",
      avatar: `/avatars/avatar-${index + 1}.jpg`,
      initials: "BT",
    },
    rating: 5,
  })
);
