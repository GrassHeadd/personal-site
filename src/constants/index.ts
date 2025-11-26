import type { NavLink, Word, ExpCard } from "../types";

const navLinks: NavLink[] = [
  { name: "Work", link: "#work" },
  { name: "Experience", link: "#experience" },
  { name: "Skills", link: "#skills" },
];

const words: Word[] = [
  { text: "Ideas", imgPath: "/images/ideas.svg" },
  { text: "Concepts", imgPath: "/images/concepts.svg" },
  { text: "Designs", imgPath: "/images/designs.svg" },
  { text: "Code", imgPath: "/images/code.svg" },
  { text: "Ideas", imgPath: "/images/ideas.svg" },
  { text: "Concepts", imgPath: "/images/concepts.svg" },
  { text: "Designs", imgPath: "/images/designs.svg" },
  { text: "Code", imgPath: "/images/code.svg" },
];

const expCards: ExpCard[] = [
  {
    review: "Building AI document tools at an early-stage startup.",
    title: "Member of Technical Staff",
    company: "Didero.ai",
    date: "Aug 2025 - Present",
    responsibilities: [
      "Built document comparison platform end-to-end",
      "Designed AI-powered field resolution engine with Django",
    ],
  },
  {
    review: "Training SEA's largest open-source LLM.",
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    responsibilities: [
      "SEA-LION v4 post-training team",
      "Built multi-agent reward pipeline with LangGraph",
      "Created code judging agent (+30% accuracy)",
    ],
  },
  {
    review: "AI research for education.",
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "Built RAG system for auto-grading with DSPy",
      "Researched AI tools for classroom use",
    ],
  },
  {
    review: "0 to 1 AI startup.",
    title: "Co-founder",
    company: "M.AI",
    date: "Apr 2024 - May 2025",
    responsibilities: [
      "AI app for short-form video marketing",
      "SMU BIG incubator (top 30/138)",
    ],
  },
];

export { words, expCards, navLinks };
