import type { NavLink, ExpCard } from "../types";

const navLinks: NavLink[] = [
  { name: "Work", link: "#work" },
  { name: "Experience", link: "#experience" },
  { name: "Skills", link: "#skills" },
];

const expCards: ExpCard[] = [
  {
    title: "Member of Technical Staff",
    company: "Didero.ai",
    date: "Aug 2025 - Present",
    responsibilities: [
      "Built document comparison platform end-to-end",
      "Designed AI-powered field resolution engine with Django",
    ],
  },
  {
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
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "Built RAG system for auto-grading with DSPy",
      "Researched AI tools for classroom use",
    ],
  },
  {
    title: "Co-founder",
    company: "M.AI",
    date: "Apr 2024 - May 2025",
    responsibilities: [
      "AI app for short-form video marketing",
      "SMU BIG incubator (top 30/138)",
    ],
  },
];

export { expCards, navLinks };
