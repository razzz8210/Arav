export interface Testimonial {
  id: number;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    initials: string;
  };
  rating: number;
}
