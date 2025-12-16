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
      "AI-powered procurement agent",
      "Building AI Agents and ship product features end-to-end",
      "B2B SAAS arc type shit",
      "Also enjoying New York City while I'm at it",
    ],
  },
  {
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    responsibilities: [
      "AI research program developing SEA-LION v4, Southeast Asia's multilingual LLM",
      "Built multi-agent reward pipeline with LangGraph for model post-training",
      "Created code judging agent that improved evaluation accuracy by 30%",
      "Experiment with RLHF solutions including PPO, GRPO, DAPO",
      "Highkey learnt a lot about AI here lmao",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "Singapore's leading university for lifelong learning and adult education",
      "Built RAG-based system with DSPy for various activities",
      "Built AI Scrappers to scrape open dynamic websites",
      "Researched and evaluated AI tools to enhance classroom teaching",
    ],
  },
];

export { expCards, navLinks };
