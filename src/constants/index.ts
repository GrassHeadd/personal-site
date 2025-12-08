import type { NavLink, ExpCard } from "../types";

const navLinks: NavLink[] = [
  { name: "App Hub", link: "/projects" },
  { name: "Talkerinos", link: "/talkerinos" },
];

const expCards: ExpCard[] = [
  {
    title: "Member of Technical Staff",
    company: "Didero.ai",
    date: "Aug 2025 - Present",
    responsibilities: [
      "AI-powered procurement platform for enterprise sourcing",
      "Building AI Agents and ship product features end-to-end",
    ],
  },
  {
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    responsibilities: [
      "National AI research program developing SEA-LION, Southeast Asia's multilingual LLM",
      "Built multi-agent reward pipeline with LangGraph for model post-training",
      "Created code judging agent that improved evaluation accuracy by 30%",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "Singapore's leading university for lifelong learning and adult education",
      "Built RAG-based auto-grading system with DSPy to streamline assessments",
      "Researched and evaluated AI tools to enhance classroom teaching",
    ],
  },
  {
    title: "Co-founder",
    company: "M.AI",
    date: "Apr 2024 - May 2025",
    responsibilities: [
      "AI startup automating short-form video marketing for businesses",
      "Led product development and secured spot in SMU BIG incubator (top 30/138)",
    ],
  },
];

export { expCards, navLinks };
