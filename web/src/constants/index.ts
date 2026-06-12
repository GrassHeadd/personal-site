import type { NavLink, ExpCard } from "../types";

const navLinks: NavLink[] = [
  { name: "app hub", link: "/projects" },
  { name: "calendar", link: "/calendar" },
  { name: "to-dos", link: "/todos" },
  { name: "talkerinos", link: "/talkerinos" },
];

const expCards: ExpCard[] = [
  {
    title: "Member of Technical Staff",
    company: "Didero",
    date: "Aug 2025 - now",
    responsibilities: [
      "Building AI agents for procurement, shipping product end-to-end.",
      "Enjoying New York City while I'm at it.",
    ],
  },
  {
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    responsibilities: [
      "SEA-LION v4 post-training: multi-agent reward pipelines, RLHF (PPO, GRPO, DAPO).",
      "Built a code-judging agent that improved evaluation accuracy by 30%.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "RAG systems with DSPy and AI scrapers for dynamic sites.",
      "Evaluated AI tools for classroom teaching.",
    ],
  },
];

export { expCards, navLinks };
