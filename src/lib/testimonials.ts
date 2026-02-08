export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
};

export const testimonials: Testimonial[] = [
  {
    name: "Ari",
    role: "Founder",
    quote: "Setup was fast and the docs were clear. This shipped in minutes.",
    rating: 5,
  },
  {
    name: "Morgan",
    role: "Staff Engineer",
    quote: "The install plan is direct and practical. Great defaults.",
    rating: 5,
  },
  {
    name: "Sam",
    role: "Indie Builder",
    quote: "Clean UI and solid guidance. It keeps the momentum going.",
    rating: 5,
  },
];
